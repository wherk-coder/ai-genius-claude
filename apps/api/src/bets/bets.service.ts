import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BetStatus, Prisma } from '@prisma/client';

@Injectable()
export class BetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBetDto: CreateBetDto) {
    const { betLegs, ...betData } = createBetDto;

    // Calculate potential payout based on odds
    const potentialPayout = betData.amount * betData.odds;

    try {
      const bet = await this.prisma.bet.create({
        data: {
          ...betData,
          userId,
          potentialPayout,
          placedAt: new Date(),
          betLegs: betLegs ? {
            create: betLegs.map(leg => ({
              gameId: leg.gameId,
              selection: leg.selection,
              odds: leg.odds,
            }))
          } : undefined,
        },
        include: {
          betLegs: {
            include: {
              game: {
                include: {
                  odds: true,
                }
              }
            }
          },
          insights: true,
        },
      });

      return bet;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Bet with this ID already exists');
        }
      }
      throw error;
    }
  }

  async findAll(userId: string, filters?: {
    sport?: string;
    status?: BetStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.BetWhereInput = {
      userId,
      ...(filters?.sport && { sport: filters.sport as any }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dateFrom || filters?.dateTo) && {
        placedAt: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        }
      }
    };

    return this.prisma.bet.findMany({
      where,
      include: {
        betLegs: {
          include: {
            game: true
          }
        },
        insights: true,
      },
      orderBy: {
        placedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
      include: {
        betLegs: {
          include: {
            game: true
          }
        },
        insights: true,
        receipt: true,
      },
    });

    if (!bet) {
      throw new NotFoundException(`Bet with ID ${id} not found`);
    }

    if (bet.userId !== userId) {
      throw new ForbiddenException('You can only access your own bets');
    }

    return bet;
  }

  async update(id: string, userId: string, updateBetDto: UpdateBetDto) {
    // First check if bet exists and belongs to user
    await this.findOne(id, userId);

    try {
      const bet = await this.prisma.bet.update({
        where: { id },
        data: updateBetDto,
        include: {
          betLegs: {
            include: {
              game: {
                include: {
                  odds: true,
                }
              }
            }
          },
          insights: true,
        },
      });

      return bet;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Bet with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    // First check if bet exists and belongs to user
    await this.findOne(id, userId);

    try {
      await this.prisma.bet.delete({
        where: { id },
      });
      return { message: 'Bet deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Bet with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async getStats(userId: string) {
    const [
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      totalWagered,
      totalWon,
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
    ]);

    const winRate = totalBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
    const roi = totalWagered._sum.amount 
      ? ((totalWon._sum.actualPayout || 0) - totalWagered._sum.amount) / totalWagered._sum.amount * 100
      : 0;

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      winRate: Math.round(winRate * 100) / 100,
      totalWagered: totalWagered._sum.amount || 0,
      totalWon: totalWon._sum.actualPayout || 0,
      netProfit: (totalWon._sum.actualPayout || 0) - (totalWagered._sum.amount || 0),
      roi: Math.round(roi * 100) / 100,
    };
  }
}