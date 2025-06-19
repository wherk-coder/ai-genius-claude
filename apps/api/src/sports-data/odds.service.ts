import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cron from 'node-cron';

export interface OddsData {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    last_update: string;
    markets: {
      key: string;
      outcomes: {
        name: string;
        price: number;
        point?: number;
      }[];
    }[];
  }[];
}

export interface LiveScore {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  scores?: {
    name: string;
    score: string;
  }[];
  last_update: string;
  completed: boolean;
}

@Injectable()
export class OddsService {
  private readonly logger = new Logger(OddsService.name);
  private readonly oddsApiKey: string;
  private readonly baseUrl = 'https://api.the-odds-api.com/v4';
  
  // Sports that we support
  private readonly supportedSports = [
    'americanfootball_nfl',
    'basketball_nba',
    'baseball_mlb',
    'icehockey_nhl',
    'americanfootball_ncaaf',
    'basketball_ncaab',
    'soccer_usa_mls',
    'tennis_atp',
    'golf_pga',
    'mma_mixed_martial_arts',
    'boxing_heavyweight',
  ];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.oddsApiKey = this.configService.get<string>('ODDS_API_KEY') || '';
    
    if (this.oddsApiKey) {
      this.initializeScheduledTasks();
    } else {
      this.logger.warn('Odds API key not configured');
    }
  }

  /**
   * Initialize scheduled tasks for odds updates
   */
  private initializeScheduledTasks() {
    // Update odds every 5 minutes during peak hours (12-23 EST)
    cron.schedule('*/5 12-23 * * *', () => {
      this.updateAllOdds();
    });

    // Update odds every 15 minutes during off-peak hours
    cron.schedule('*/15 0-11,23-59 * * *', () => {
      this.updateAllOdds();
    });

    // Update live scores every 30 seconds during games
    cron.schedule('*/30 * * * * *', () => {
      this.updateLiveScores();
    });

    this.logger.log('Scheduled odds update tasks initialized');
  }

  /**
   * Get live odds for a specific sport
   */
  async getOdds(sport: string, markets = 'h2h,spreads,totals'): Promise<OddsData[]> {
    if (!this.oddsApiKey) {
      throw new Error('Odds API not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/sports/${sport}/odds`, {
        params: {
          apiKey: this.oddsApiKey,
          regions: 'us',
          markets,
          oddsFormat: 'american',
          dateFormat: 'iso',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch odds for ${sport}:`, error);
      throw error;
    }
  }

  /**
   * Get live scores for a specific sport
   */
  async getLiveScores(sport: string): Promise<LiveScore[]> {
    if (!this.oddsApiKey) {
      throw new Error('Odds API not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/sports/${sport}/scores`, {
        params: {
          apiKey: this.oddsApiKey,
          daysFrom: 1,
          dateFormat: 'iso',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch scores for ${sport}:`, error);
      throw error;
    }
  }

  /**
   * Update odds for all supported sports
   */
  async updateAllOdds(): Promise<void> {
    this.logger.log('Starting scheduled odds update');

    for (const sport of this.supportedSports) {
      try {
        const odds = await this.getOdds(sport);
        await this.storeOdds(sport, odds);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        this.logger.error(`Failed to update odds for ${sport}:`, error);
      }
    }

    this.logger.log('Completed scheduled odds update');
  }

  /**
   * Update live scores for all supported sports
   */
  async updateLiveScores(): Promise<void> {
    for (const sport of this.supportedSports) {
      try {
        const scores = await this.getLiveScores(sport);
        await this.storeScores(sport, scores);
      } catch (error) {
        this.logger.error(`Failed to update scores for ${sport}:`, error);
      }
    }
  }

  /**
   * Store odds data in database
   */
  private async storeOdds(sport: string, odds: OddsData[]): Promise<void> {
    try {
      for (const game of odds) {
        // Update or create game record
        await this.prisma.game.upsert({
          where: {
            externalId: game.id,
          },
          update: {
            homeTeam: game.home_team,
            awayTeam: game.away_team,
            gameTime: new Date(game.commence_time),
            sport: this.mapSportKey(game.sport_key),
            updatedAt: new Date(),
          },
          create: {
            externalId: game.id,
            homeTeam: game.home_team,
            awayTeam: game.away_team,
            gameTime: new Date(game.commence_time),
            sport: this.mapSportKey(game.sport_key),
            league: game.sport_title,
            status: 'SCHEDULED',
          },
        });

        // Store odds for each bookmaker
        for (const bookmaker of game.bookmakers) {
          for (const market of bookmaker.markets) {
            for (const outcome of market.outcomes) {
              await this.prisma.odds.upsert({
                where: {
                  gameId_bookmaker_market_outcome: {
                    gameId: game.id,
                    bookmaker: bookmaker.key,
                    market: market.key,
                    outcome: outcome.name,
                  },
                },
                update: {
                  price: outcome.price,
                  point: outcome.point,
                  lastUpdate: new Date(bookmaker.last_update),
                },
                create: {
                  gameId: game.id,
                  bookmaker: bookmaker.key,
                  bookmakerTitle: bookmaker.title,
                  market: market.key,
                  outcome: outcome.name,
                  price: outcome.price,
                  point: outcome.point,
                  lastUpdate: new Date(bookmaker.last_update),
                },
              });
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to store odds data:', error);
    }
  }

  /**
   * Store live scores in database
   */
  private async storeScores(sport: string, scores: LiveScore[]): Promise<void> {
    try {
      for (const score of scores) {
        await this.prisma.game.upsert({
          where: {
            externalId: score.id,
          },
          update: {
            status: score.completed ? 'COMPLETED' : 'LIVE',
            homeScore: score.scores?.find(s => s.name === score.home_team)?.score ? 
              parseInt(score.scores.find(s => s.name === score.home_team)?.score || '0') : null,
            awayScore: score.scores?.find(s => s.name === score.away_team)?.score ? 
              parseInt(score.scores.find(s => s.name === score.away_team)?.score || '0') : null,
            updatedAt: new Date(score.last_update),
          },
          create: {
            externalId: score.id,
            homeTeam: score.home_team,
            awayTeam: score.away_team,
            gameTime: new Date(score.commence_time),
            sport: this.mapSportKey(score.sport_key),
            status: score.completed ? 'COMPLETED' : 'LIVE',
            homeScore: score.scores?.find(s => s.name === score.home_team)?.score ? 
              parseInt(score.scores.find(s => s.name === score.home_team)?.score || '0') : null,
            awayScore: score.scores?.find(s => s.name === score.away_team)?.score ? 
              parseInt(score.scores.find(s => s.name === score.away_team)?.score || '0') : null,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to store scores data:', error);
    }
  }

  /**
   * Map external sport keys to internal format
   */
  private mapSportKey(sportKey: string): 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB' | 'SOCCER' | 'TENNIS' | 'GOLF' | 'MMA' | 'BOXING' | 'RACING' {
    const mapping: { [key: string]: 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB' | 'SOCCER' | 'TENNIS' | 'GOLF' | 'MMA' | 'BOXING' | 'RACING' } = {
      'americanfootball_nfl': 'NFL',
      'basketball_nba': 'NBA',
      'baseball_mlb': 'MLB',
      'icehockey_nhl': 'NHL',
      'americanfootball_ncaaf': 'NCAAF',
      'basketball_ncaab': 'NCAAB',
      'soccer_usa_mls': 'SOCCER',
      'tennis_atp': 'TENNIS',
      'golf_pga': 'GOLF',
      'mma_mixed_martial_arts': 'MMA',
      'boxing_heavyweight': 'BOXING',
    };

    return mapping[sportKey] || 'RACING';
  }

  /**
   * Get odds comparison for a specific game
   */
  async getOddsComparison(gameId: string): Promise<any> {
    try {
      const odds = await this.prisma.odds.findMany({
        where: { gameId },
        orderBy: [
          { market: 'asc' },
          { bookmaker: 'asc' },
        ],
      });

      // Group by market type
      const comparison: any = odds.reduce((acc: any, odd) => {
        if (!acc[odd.market]) {
          acc[odd.market] = {};
        }
        if (!acc[odd.market][odd.outcome]) {
          acc[odd.market][odd.outcome] = [];
        }
        
        acc[odd.market][odd.outcome].push({
          bookmaker: odd.bookmakerTitle,
          price: odd.price,
          point: odd.point,
          lastUpdate: odd.lastUpdate,
        });

        return acc;
      }, {});

      // Find best odds for each outcome
      Object.keys(comparison).forEach(market => {
        Object.keys(comparison[market]).forEach(outcome => {
          comparison[market][outcome] = comparison[market][outcome].sort((a: any, b: any) => {
            // For positive odds, higher is better
            // For negative odds, closer to 0 is better
            if (a.price > 0 && b.price > 0) return b.price - a.price;
            if (a.price < 0 && b.price < 0) return a.price - b.price;
            if (a.price > 0 && b.price < 0) return -1;
            if (a.price < 0 && b.price > 0) return 1;
            return 0;
          });
        });
      });

      return comparison;
    } catch (error) {
      this.logger.error('Failed to get odds comparison:', error);
      throw error;
    }
  }

  /**
   * Get upcoming games with odds
   */
  async getUpcomingGamesWithOdds(sport?: string, limit = 20): Promise<any> {
    try {
      const where = sport ? { sport: sport as any } : {};
      
      const games = await this.prisma.game.findMany({
        where: {
          ...where,
          gameTime: {
            gte: new Date(),
          },
          status: 'SCHEDULED',
        },
        take: limit,
        orderBy: { gameTime: 'asc' },
        include: {
          odds: {
            where: { market: 'h2h' }, // Moneyline odds
            orderBy: { lastUpdate: 'desc' },
          },
        },
      });

      return games.map(game => ({
        ...game,
        bestOdds: this.getBestOddsForGame(game.odds || []),
      }));
    } catch (error) {
      this.logger.error('Failed to get upcoming games:', error);
      throw error;
    }
  }

  /**
   * Helper to extract best odds for a game
   */
  private getBestOddsForGame(odds: any[]): any {
    const grouped: any = odds.reduce((acc: any, odd) => {
      if (!acc[odd.outcome]) {
        acc[odd.outcome] = [];
      }
      acc[odd.outcome].push(odd);
      return acc;
    }, {});

    Object.keys(grouped).forEach(outcome => {
      grouped[outcome] = grouped[outcome]
        .sort((a: any, b: any) => {
          if (a.price > 0 && b.price > 0) return b.price - a.price;
          if (a.price < 0 && b.price < 0) return a.price - b.price;
          if (a.price > 0 && b.price < 0) return -1;
          if (a.price < 0 && b.price > 0) return 1;
          return 0;
        })[0];
    });

    return grouped;
  }

  /**
   * Health check for odds service
   */
  async isHealthy(): Promise<boolean> {
    if (!this.oddsApiKey) return false;
    
    try {
      const response = await axios.get(`${this.baseUrl}/sports`, {
        params: { apiKey: this.oddsApiKey },
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}