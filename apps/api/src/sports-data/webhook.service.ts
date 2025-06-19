import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GameUpdateWebhook {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'COMPLETED' | 'CANCELLED';
  period?: string;
  timeRemaining?: string;
  lastUpdate: string;
}

export interface OddsUpdateWebhook {
  gameId: string;
  bookmaker: string;
  market: string;
  odds: {
    outcome: string;
    price: number;
    point?: number;
  }[];
  lastUpdate: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Handle game update webhook
   */
  async handleGameUpdate(webhook: GameUpdateWebhook): Promise<void> {
    try {
      this.logger.log(`Processing game update for ${webhook.gameId}`);

      // Update game status and scores
      const updatedGame = await this.prisma.game.update({
        where: { externalId: webhook.gameId },
        data: {
          status: webhook.status,
          homeScore: webhook.homeScore,
          awayScore: webhook.awayScore,
          period: webhook.period,
          timeRemaining: webhook.timeRemaining,
          updatedAt: new Date(webhook.lastUpdate),
        },
        include: {
          betLegs: {
            include: {
              bet: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Check if game is completed and settle bets
      if (webhook.status === 'COMPLETED') {
        await this.settleBetsForGame(updatedGame);
      }

      // Send real-time notifications for live games
      if (webhook.status === 'LIVE' || webhook.status === 'COMPLETED') {
        await this.sendGameUpdateNotifications(updatedGame, webhook);
      }

    } catch (error) {
      this.logger.error(`Failed to process game update for ${webhook.gameId}:`, error);
      throw error;
    }
  }

  /**
   * Handle odds update webhook
   */
  async handleOddsUpdate(webhook: OddsUpdateWebhook): Promise<void> {
    try {
      this.logger.log(`Processing odds update for ${webhook.gameId}`);

      // Update odds in database
      for (const odd of webhook.odds) {
        await this.prisma.odds.upsert({
          where: {
            gameId_bookmaker_market_outcome: {
              gameId: webhook.gameId,
              bookmaker: webhook.bookmaker,
              market: webhook.market,
              outcome: odd.outcome,
            },
          },
          update: {
            price: odd.price,
            point: odd.point,
            lastUpdate: new Date(webhook.lastUpdate),
          },
          create: {
            gameId: webhook.gameId,
            bookmaker: webhook.bookmaker,
            bookmakerTitle: webhook.bookmaker,
            market: webhook.market,
            outcome: odd.outcome,
            price: odd.price,
            point: odd.point,
            lastUpdate: new Date(webhook.lastUpdate),
          },
        });
      }

      // Check for significant odds movements
      await this.checkOddsMovements(webhook);

    } catch (error) {
      this.logger.error(`Failed to process odds update for ${webhook.gameId}:`, error);
      throw error;
    }
  }

  /**
   * Settle bets for a completed game
   */
  private async settleBetsForGame(game: any): Promise<void> {
    try {
      this.logger.log(`Settling bets for completed game: ${game.homeTeam} vs ${game.awayTeam}`);

      for (const betLeg of game.betLegs) {
        const bet = betLeg.bet;
        if (bet.status !== 'PENDING') continue;

        let legResult: 'WON' | 'LOST' | 'PUSHED' = 'LOST';

        // Determine leg result based on bet type
        switch (betLeg.type) {
          case 'MONEYLINE':
            legResult = this.settleMoneyline(betLeg, game);
            break;
          case 'SPREAD':
            legResult = this.settleSpread(betLeg, game);
            break;
          case 'TOTAL':
            legResult = this.settleTotal(betLeg, game);
            break;
          case 'PROP':
            // Props would need specific handling based on prop type
            legResult = 'PUSHED';
            break;
        }

        // Update bet leg result
        await this.prisma.betLeg.update({
          where: { id: betLeg.id },
          data: { result: legResult },
        });

        // If this is a single bet, update the main bet
        if (bet.type === 'STRAIGHT') {
          const actualPayout = legResult === 'WON' ? bet.potentialPayout : 0;
          
          await this.prisma.bet.update({
            where: { id: bet.id },
            data: {
              status: legResult,
              actualPayout,
              settledAt: new Date(),
            },
          });

          // Send settlement notification
          await this.sendBetSettlementNotification(bet, legResult, actualPayout);
        }
      }

      // Handle parlay bets
      await this.settleParlayBets(game.betLegs);

    } catch (error) {
      this.logger.error('Failed to settle bets:', error);
    }
  }

  /**
   * Settle moneyline bets
   */
  private settleMoneyline(betLeg: any, game: any): 'WON' | 'LOST' | 'PUSHED' {
    const winner = game.homeScore > game.awayScore ? game.homeTeam : 
                   game.awayScore > game.homeScore ? game.awayTeam : null;

    if (!winner) return 'PUSHED'; // Tie
    return betLeg.selection === winner ? 'WON' : 'LOST';
  }

  /**
   * Settle spread bets
   */
  private settleSpread(betLeg: any, game: any): 'WON' | 'LOST' | 'PUSHED' {
    const handicap = betLeg.handicap || 0;
    const adjustedHomeScore = game.homeScore + (betLeg.selection === game.homeTeam ? handicap : -handicap);
    const adjustedAwayScore = game.awayScore + (betLeg.selection === game.awayTeam ? handicap : -handicap);

    if (adjustedHomeScore === adjustedAwayScore) return 'PUSHED';
    
    const winner = adjustedHomeScore > adjustedAwayScore ? game.homeTeam : game.awayTeam;
    return betLeg.selection === winner ? 'WON' : 'LOST';
  }

  /**
   * Settle total (over/under) bets
   */
  private settleTotal(betLeg: any, game: any): 'WON' | 'LOST' | 'PUSHED' {
    const totalScore = game.homeScore + game.awayScore;
    const total = betLeg.total || 0;

    if (totalScore === total) return 'PUSHED';
    
    const isOver = betLeg.selection.toLowerCase().includes('over');
    return (isOver && totalScore > total) || (!isOver && totalScore < total) ? 'WON' : 'LOST';
  }

  /**
   * Settle parlay bets
   */
  private async settleParlayBets(betLegs: any[]): Promise<void> {
    const parlayBets = new Map();

    // Group legs by bet ID
    betLegs.forEach(leg => {
      if (leg.bet.type === 'PARLAY') {
        if (!parlayBets.has(leg.bet.id)) {
          parlayBets.set(leg.bet.id, { bet: leg.bet, legs: [] });
        }
        parlayBets.get(leg.bet.id).legs.push(leg);
      }
    });

    // Settle each parlay
    for (const [betId, parlayData] of parlayBets) {
      const { bet, legs } = parlayData;
      
      // Check if all legs are settled
      const pendingLegs = legs.filter((leg: any) => !leg.result);
      if (pendingLegs.length > 0) continue;

      // Determine parlay result
      const lostLegs = legs.filter((leg: any) => leg.result === 'LOST');
      const pushedLegs = legs.filter((leg: any) => leg.result === 'PUSHED');

      let status: 'WON' | 'LOST' | 'PUSHED';
      let actualPayout = 0;

      if (lostLegs.length > 0) {
        status = 'LOST';
      } else if (pushedLegs.length === legs.length) {
        status = 'PUSHED';
        actualPayout = bet.amount; // Return original stake
      } else {
        status = 'WON';
        actualPayout = bet.potentialPayout;
      }

      await this.prisma.bet.update({
        where: { id: betId },
        data: {
          status,
          actualPayout,
          settledAt: new Date(),
        },
      });

      await this.sendBetSettlementNotification(bet, status, actualPayout);
    }
  }

  /**
   * Check for significant odds movements
   */
  private async checkOddsMovements(webhook: OddsUpdateWebhook): Promise<void> {
    try {
      // Get previous odds for comparison
      const previousOdds = await this.prisma.odds.findMany({
        where: {
          gameId: webhook.gameId,
          market: webhook.market,
          lastUpdate: {
            lt: new Date(webhook.lastUpdate),
          },
        },
        orderBy: { lastUpdate: 'desc' },
        take: webhook.odds.length,
      });

      // Compare and detect significant movements (>10 points for American odds)
      for (const newOdd of webhook.odds) {
        const oldOdd = previousOdds.find(
          o => o.outcome === newOdd.outcome && o.bookmaker === webhook.bookmaker
        );

        if (oldOdd && Math.abs(newOdd.price - oldOdd.price) >= 10) {
          this.logger.log(
            `Significant odds movement detected: ${webhook.gameId} ${newOdd.outcome} ` +
            `${oldOdd.price} -> ${newOdd.price} (${webhook.bookmaker})`
          );

          // Send notifications to users with bets on this game
          await this.sendOddsMovementNotifications(webhook.gameId, {
            outcome: newOdd.outcome,
            oldPrice: oldOdd.price,
            newPrice: newOdd.price,
            bookmaker: webhook.bookmaker,
          });
        }
      }
    } catch (error) {
      this.logger.error('Failed to check odds movements:', error);
    }
  }

  /**
   * Send game update notifications
   */
  private async sendGameUpdateNotifications(game: any, webhook: GameUpdateWebhook): Promise<void> {
    // This would integrate with the notification service
    // For now, just log the notification
    this.logger.log(
      `Game update notification: ${game.homeTeam} ${game.homeScore || 0} - ` +
      `${game.awayScore || 0} ${game.awayTeam} (${webhook.status})`
    );
  }

  /**
   * Send bet settlement notifications
   */
  private async sendBetSettlementNotification(
    bet: any, 
    result: 'WON' | 'LOST' | 'PUSHED', 
    payout: number
  ): Promise<void> {
    this.logger.log(
      `Bet settlement notification: Bet ${bet.id} ${result} - ` +
      `Payout: $${payout} (User: ${bet.userId})`
    );
  }

  /**
   * Send odds movement notifications
   */
  private async sendOddsMovementNotifications(
    gameId: string, 
    movement: {
      outcome: string;
      oldPrice: number;
      newPrice: number;
      bookmaker: string;
    }
  ): Promise<void> {
    this.logger.log(
      `Odds movement notification: ${gameId} ${movement.outcome} ` +
      `${movement.oldPrice} -> ${movement.newPrice} (${movement.bookmaker})`
    );
  }

  /**
   * Validate webhook signature (for security)
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implement webhook signature validation
    // This would typically use HMAC SHA256
    return true; // Placeholder
  }
}