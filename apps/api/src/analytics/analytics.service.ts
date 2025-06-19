import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BetStatus, Sport, BetType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserAnalytics(userId: string) {
    const [
      totalBets,
      betsWon,
      betsLost,
      betsPending,
      totalWagered,
      totalWon,
      biggestWin,
      biggestLoss,
      averageBetSize,
      recentBets,
    ] = await Promise.all([
      this.prisma.bet.count({ where: { userId } }),
      this.prisma.bet.count({ where: { userId, status: BetStatus.WON } }),
      this.prisma.bet.count({ where: { userId, status: BetStatus.LOST } }),
      this.prisma.bet.count({ where: { userId, status: BetStatus.PENDING } }),
      this.prisma.bet.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma.bet.aggregate({
        where: { userId, status: BetStatus.WON },
        _sum: { actualPayout: true },
      }),
      this.prisma.bet.findFirst({
        where: { userId, status: BetStatus.WON },
        orderBy: { actualPayout: 'desc' },
        select: { actualPayout: true, description: true, amount: true },
      }),
      this.prisma.bet.findFirst({
        where: { userId, status: BetStatus.LOST },
        orderBy: { amount: 'desc' },
        select: { amount: true, description: true },
      }),
      this.prisma.bet.aggregate({
        where: { userId },
        _avg: { amount: true },
      }),
      this.prisma.bet.findMany({
        where: { userId },
        orderBy: { placedAt: 'desc' },
        take: 10,
        include: {
          betLegs: {
            include: {
              game: {
                include: {
                  homeTeam: true,
                  awayTeam: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const winRate = totalBets > 0 ? (betsWon / (betsWon + betsLost)) * 100 : 0;
    const totalWageredAmount = totalWagered._sum.amount || 0;
    const totalWonAmount = totalWon._sum.actualPayout || 0;
    const netProfit = totalWonAmount - totalWageredAmount;
    const roi = totalWageredAmount > 0 ? (netProfit / totalWageredAmount) * 100 : 0;

    return {
      overview: {
        totalBets,
        betsWon,
        betsLost,
        betsPending,
        winRate: Math.round(winRate * 100) / 100,
        totalWagered: totalWageredAmount,
        totalWon: totalWonAmount,
        netProfit,
        roi: Math.round(roi * 100) / 100,
        averageBetSize: Math.round((averageBetSize._avg.amount || 0) * 100) / 100,
      },
      highlights: {
        biggestWin: biggestWin ? {
          amount: biggestWin.actualPayout,
          description: biggestWin.description,
          profit: (biggestWin.actualPayout || 0) - biggestWin.amount,
        } : null,
        biggestLoss: biggestLoss ? {
          amount: biggestLoss.amount,
          description: biggestLoss.description,
        } : null,
      },
      recentBets,
    };
  }

  async getBettingTrends(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        placedAt: {
          gte: startDate,
        },
      },
      orderBy: { placedAt: 'asc' },
    });

    // Group by day
    const dailyStats: { [key: string]: any } = {};
    bets.forEach(bet => {
      const day = bet.placedAt.toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = {
          date: day,
          betsCount: 0,
          totalWagered: 0,
          totalWon: 0,
          won: 0,
          lost: 0,
        };
      }
      
      dailyStats[day].betsCount++;
      dailyStats[day].totalWagered += bet.amount;
      
      if (bet.status === BetStatus.WON) {
        dailyStats[day].won++;
        dailyStats[day].totalWon += bet.actualPayout || 0;
      } else if (bet.status === BetStatus.LOST) {
        dailyStats[day].lost++;
      }
    });

    return Object.values(dailyStats);
  }

  async getSportBreakdown(userId: string) {
    const sportStats = await this.prisma.bet.groupBy({
      by: ['sport', 'status'],
      where: { userId },
      _count: { _all: true },
      _sum: { amount: true, actualPayout: true },
    });

    const breakdown: { [key: string]: any } = {};
    sportStats.forEach(stat => {
      if (!breakdown[stat.sport]) {
        breakdown[stat.sport] = {
          sport: stat.sport,
          total: 0,
          won: 0,
          lost: 0,
          pending: 0,
          totalWagered: 0,
          totalWon: 0,
        };
      }
      
      breakdown[stat.sport].total += stat._count._all;
      breakdown[stat.sport].totalWagered += stat._sum.amount || 0;
      
      if (stat.status === BetStatus.WON) {
        breakdown[stat.sport].won += stat._count._all;
        breakdown[stat.sport].totalWon += stat._sum.actualPayout || 0;
      } else if (stat.status === BetStatus.LOST) {
        breakdown[stat.sport].lost += stat._count._all;
      } else if (stat.status === BetStatus.PENDING) {
        breakdown[stat.sport].pending += stat._count._all;
      }
    });

    // Calculate win rates and ROI
    Object.values(breakdown).forEach((sport: any) => {
      sport.winRate = sport.won + sport.lost > 0 
        ? (sport.won / (sport.won + sport.lost)) * 100 
        : 0;
      sport.roi = sport.totalWagered > 0 
        ? ((sport.totalWon - sport.totalWagered) / sport.totalWagered) * 100 
        : 0;
      sport.winRate = Math.round(sport.winRate * 100) / 100;
      sport.roi = Math.round(sport.roi * 100) / 100;
    });

    return Object.values(breakdown);
  }

  async getBetTypeAnalysis(userId: string) {
    const betTypeStats = await this.prisma.bet.groupBy({
      by: ['type', 'status'],
      where: { userId },
      _count: { _all: true },
      _sum: { amount: true, actualPayout: true },
    });

    const analysis: { [key: string]: any } = {};
    betTypeStats.forEach(stat => {
      if (!analysis[stat.type]) {
        analysis[stat.type] = {
          type: stat.type,
          total: 0,
          won: 0,
          lost: 0,
          pending: 0,
          totalWagered: 0,
          totalWon: 0,
        };
      }
      
      analysis[stat.type].total += stat._count._all;
      analysis[stat.type].totalWagered += stat._sum.amount || 0;
      
      if (stat.status === BetStatus.WON) {
        analysis[stat.type].won += stat._count._all;
        analysis[stat.type].totalWon += stat._sum.actualPayout || 0;
      } else if (stat.status === BetStatus.LOST) {
        analysis[stat.type].lost += stat._count._all;
      } else if (stat.status === BetStatus.PENDING) {
        analysis[stat.type].pending += stat._count._all;
      }
    });

    // Calculate metrics
    Object.values(analysis).forEach((betType: any) => {
      betType.winRate = betType.won + betType.lost > 0 
        ? (betType.won / (betType.won + betType.lost)) * 100 
        : 0;
      betType.roi = betType.totalWagered > 0 
        ? ((betType.totalWon - betType.totalWagered) / betType.totalWagered) * 100 
        : 0;
      betType.averageBetSize = betType.total > 0 
        ? betType.totalWagered / betType.total 
        : 0;
      
      betType.winRate = Math.round(betType.winRate * 100) / 100;
      betType.roi = Math.round(betType.roi * 100) / 100;
      betType.averageBetSize = Math.round(betType.averageBetSize * 100) / 100;
    });

    return Object.values(analysis);
  }

  async getBankrollHistory(userId: string, days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        placedAt: {
          gte: startDate,
        },
      },
      orderBy: { placedAt: 'asc' },
      select: {
        placedAt: true,
        amount: true,
        actualPayout: true,
        status: true,
      },
    });

    let runningBalance = 0;
    const bankrollHistory: any[] = [];

    bets.forEach(bet => {
      runningBalance -= bet.amount; // Money wagered

      if (bet.status === BetStatus.WON && bet.actualPayout) {
        runningBalance += bet.actualPayout; // Money won
      }

      bankrollHistory.push({
        date: bet.placedAt.toISOString().split('T')[0],
        balance: Math.round(runningBalance * 100) / 100,
        change: bet.status === BetStatus.WON 
          ? (bet.actualPayout || 0) - bet.amount
          : -bet.amount,
      });
    });

    return bankrollHistory;
  }

  async getInsights(userId: string) {
    const [sportBreakdown, betTypeAnalysis, userAnalytics] = await Promise.all([
      this.getSportBreakdown(userId),
      this.getBetTypeAnalysis(userId),
      this.getUserAnalytics(userId),
    ]);

    const insights = [];

    // Best performing sport
    const bestSport = sportBreakdown.reduce((best, sport) => 
      sport.roi > best.roi ? sport : best, sportBreakdown[0] || { roi: -Infinity }
    );
    
    if (bestSport && bestSport.roi > 0) {
      insights.push({
        type: 'best_sport',
        title: `${bestSport.sport} is your strongest sport`,
        message: `You have a ${bestSport.winRate}% win rate and ${bestSport.roi}% ROI in ${bestSport.sport}`,
        confidence: 0.8,
      });
    }

    // Best bet type
    const bestBetType = betTypeAnalysis.reduce((best, type) => 
      type.roi > best.roi ? type : best, betTypeAnalysis[0] || { roi: -Infinity }
    );
    
    if (bestBetType && bestBetType.roi > 0) {
      insights.push({
        type: 'best_bet_type',
        title: `${bestBetType.type} bets work well for you`,
        message: `Your ${bestBetType.type} bets have a ${bestBetType.winRate}% win rate and ${bestBetType.roi}% ROI`,
        confidence: 0.75,
      });
    }

    // Bankroll management
    if (userAnalytics.overview.averageBetSize > userAnalytics.overview.totalWagered * 0.1) {
      insights.push({
        type: 'bankroll_warning',
        title: 'Consider smaller bet sizes',
        message: `Your average bet size (${userAnalytics.overview.averageBetSize}) might be too large relative to your total bankroll`,
        confidence: 0.7,
      });
    }

    return insights;
  }
}