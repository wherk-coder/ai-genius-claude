import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OddsService } from './odds.service';

@Injectable()
export class SportsDataService {
  private readonly logger = new Logger(SportsDataService.name);

  constructor(
    private prisma: PrismaService,
    private oddsService: OddsService,
  ) {}

  /**
   * Get live games with real-time scores
   */
  async getLiveGames(sport?: string): Promise<any[]> {
    try {
      const where = sport ? { sport } : {};
      
      return await this.prisma.game.findMany({
        where: {
          ...where,
          status: 'LIVE',
        },
        orderBy: { gameTime: 'asc' },
        include: {
          odds: {
            where: { market: 'h2h' },
            orderBy: { lastUpdate: 'desc' },
            take: 6, // Best odds from top bookmakers
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to get live games:', error);
      throw error;
    }
  }

  /**
   * Get upcoming games with odds
   */
  async getUpcomingGames(sport?: string, days = 7): Promise<any[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const where = sport ? { sport } : {};
      
      return await this.prisma.game.findMany({
        where: {
          ...where,
          gameTime: {
            gte: new Date(),
            lte: endDate,
          },
          status: 'SCHEDULED',
        },
        take: 50,
        orderBy: { gameTime: 'asc' },
        include: {
          odds: {
            where: { market: 'h2h' },
            orderBy: { lastUpdate: 'desc' },
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to get upcoming games:', error);
      throw error;
    }
  }

  /**
   * Get completed games with results
   */
  async getCompletedGames(sport?: string, days = 7): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const where = sport ? { sport } : {};
      
      return await this.prisma.game.findMany({
        where: {
          ...where,
          gameTime: {
            gte: startDate,
          },
          status: 'COMPLETED',
        },
        take: 100,
        orderBy: { gameTime: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to get completed games:', error);
      throw error;
    }
  }

  /**
   * Get odds comparison for a specific game
   */
  async getGameOddsComparison(gameId: string): Promise<any> {
    try {
      return await this.oddsService.getOddsComparison(gameId);
    } catch (error) {
      this.logger.error(`Failed to get odds comparison for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Get trending games (most bet on)
   */
  async getTrendingGames(limit = 10): Promise<any[]> {
    try {
      const result = await this.prisma.game.findMany({
        where: {
          gameTime: {
            gte: new Date(),
          },
          status: 'SCHEDULED',
        },
        include: {
          betLegs: {
            include: {
              bet: true,
            },
          },
          odds: {
            where: { market: 'h2h' },
            orderBy: { lastUpdate: 'desc' },
            take: 2,
          },
        },
        orderBy: { gameTime: 'asc' },
      });

      // Sort by number of bets placed
      return result
        .map(game => ({
          ...game,
          betCount: game.betLegs.length,
          totalVolume: game.betLegs.reduce(
            (sum, leg) => sum + leg.bet.amount, 0
          ),
        }))
        .sort((a, b) => b.betCount - a.betCount)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get trending games:', error);
      throw error;
    }
  }

  /**
   * Get games by team
   */
  async getGamesByTeam(teamName: string, limit = 20): Promise<any[]> {
    try {
      return await this.prisma.game.findMany({
        where: {
          OR: [
            { homeTeam: { contains: teamName, mode: 'insensitive' } },
            { awayTeam: { contains: teamName, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { gameTime: 'desc' },
        include: {
          odds: {
            where: { market: 'h2h' },
            orderBy: { lastUpdate: 'desc' },
            take: 2,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get games for team ${teamName}:`, error);
      throw error;
    }
  }

  /**
   * Search games
   */
  async searchGames(query: string, limit = 20): Promise<any[]> {
    try {
      return await this.prisma.game.findMany({
        where: {
          OR: [
            { homeTeam: { contains: query, mode: 'insensitive' } },
            { awayTeam: { contains: query, mode: 'insensitive' } },
            { league: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { gameTime: 'desc' },
        include: {
          odds: {
            where: { market: 'h2h' },
            orderBy: { lastUpdate: 'desc' },
            take: 2,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to search games with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get sports statistics
   */
  async getSportsStats(): Promise<any> {
    try {
      const stats = await this.prisma.game.groupBy({
        by: ['sport', 'status'],
        _count: {
          id: true,
        },
      });

      const formatted = stats.reduce((acc, stat) => {
        if (!acc[stat.sport]) {
          acc[stat.sport] = {};
        }
        acc[stat.sport][stat.status] = stat._count.id;
        return acc;
      }, {});

      return formatted;
    } catch (error) {
      this.logger.error('Failed to get sports stats:', error);
      throw error;
    }
  }

  /**
   * Force refresh odds for all sports
   */
  async forceRefreshOdds(): Promise<{ success: boolean; message: string }> {
    try {
      await this.oddsService.updateAllOdds();
      return {
        success: true,
        message: 'Odds refresh initiated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to force refresh odds:', error);
      return {
        success: false,
        message: `Failed to refresh odds: ${error.message}`,
      };
    }
  }

  /**
   * Health check for sports data services
   */
  async getHealthStatus(): Promise<{
    database: boolean;
    oddsApi: boolean;
    lastUpdate: Date | null;
  }> {
    try {
      // Check database connection
      let database = false;
      try {
        await this.prisma.game.findFirst();
        database = true;
      } catch {
        database = false;
      }

      // Check odds API
      const oddsApi = await this.oddsService.isHealthy();

      // Get last update time
      const lastGame = await this.prisma.game.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      });

      return {
        database,
        oddsApi,
        lastUpdate: lastGame?.updatedAt || null,
      };
    } catch (error) {
      this.logger.error('Failed to get health status:', error);
      return {
        database: false,
        oddsApi: false,
        lastUpdate: null,
      };
    }
  }
}