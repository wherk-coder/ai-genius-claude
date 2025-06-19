import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Sport, Prisma } from '@prisma/client';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

  // Teams
  async createTeam(createTeamDto: CreateTeamDto) {
    try {
      return await this.prisma.team.create({
        data: createTeamDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Team with this external ID already exists');
        }
      }
      throw error;
    }
  }

  async findAllTeams(sport?: Sport) {
    const where = sport ? { sport } : {};
    return this.prisma.team.findMany({
      where,
      orderBy: [
        { sport: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findTeamById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Get recent games for this team
    const recentGames = await this.prisma.game.findMany({
      where: {
        OR: [
          { homeTeam: team.name },
          { awayTeam: team.name },
        ],
      },
      orderBy: { gameTime: 'desc' },
      take: 10,
      include: {
        odds: true,
      },
    });

    return {
      ...team,
      recentGames,
    };
  }

  // Games
  async createGame(createGameDto: CreateGameDto) {
    try {
      return await this.prisma.game.create({
        data: createGameDto,
        include: {
          odds: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Game with this external ID already exists');
        }
        if (error.code === 'P2003') {
          throw new Error('Invalid team ID provided');
        }
      }
      throw error;
    }
  }

  async findAllGames(filters?: {
    sport?: Sport;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    teamId?: string;
  }) {
    const where: Prisma.GameWhereInput = {
      ...(filters?.sport && { sport: filters.sport }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dateFrom || filters?.dateTo) && {
        gameTime: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        }
      },
      ...(filters?.teamId && {
        OR: [
          { homeTeam: { contains: filters.teamId } },
          { awayTeam: { contains: filters.teamId } },
        ]
      }),
    };

    return this.prisma.game.findMany({
      where,
      include: {
        odds: true,
      },
      orderBy: {
        gameTime: 'desc',
      },
    });
  }

  async findGameById(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        odds: true,
        betLegs: {
          include: {
            bet: {
              select: {
                id: true,
                type: true,
                amount: true,
                status: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  async updateGame(id: string, updateGameDto: UpdateGameDto) {
    try {
      const game = await this.prisma.game.update({
        where: { id },
        data: updateGameDto,
        include: {
          odds: true,
        },
      });

      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Game with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async getUpcomingGames(sport?: Sport, limit: number = 20) {
    const where: Prisma.GameWhereInput = {
      gameTime: {
        gt: new Date(),
      },
      ...(sport && { sport }),
    };

    return this.prisma.game.findMany({
      where,
      include: {
        odds: true,
      },
      orderBy: {
        gameTime: 'asc',
      },
      take: limit,
    });
  }

  async getLiveGames(sport?: Sport) {
    const where: Prisma.GameWhereInput = {
      status: 'live',
      ...(sport && { sport }),
    };

    return this.prisma.game.findMany({
      where,
      include: {
        odds: true,
      },
      orderBy: {
        gameTime: 'asc',
      },
    });
  }

  async getGameOdds(gameId: string) {
    const game = await this.findGameById(gameId);
    return {
      gameId: game.id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      gameTime: game.gameTime,
      odds: game.odds,
    };
  }

  async updateGameOdds(gameId: string, oddsData: any[]) {
    // Clear existing odds for this game
    await this.prisma.odds.deleteMany({
      where: { gameId },
    });

    // Create new odds records
    const odds = await this.prisma.odds.createMany({
      data: oddsData.map(odd => ({
        ...odd,
        gameId,
        lastUpdate: new Date(),
      })),
    });

    return odds;
  }

  async getSportStats(sport: Sport) {
    const [totalGames, liveGames, upcomingGames, teams] = await Promise.all([
      this.prisma.game.count({ where: { sport } }),
      this.prisma.game.count({ where: { sport, status: 'live' } }),
      this.prisma.game.count({ 
        where: { 
          sport, 
          gameTime: { gt: new Date() } 
        } 
      }),
      this.prisma.team.count({ where: { sport } }),
    ]);

    return {
      sport,
      totalGames,
      liveGames,
      upcomingGames,
      teams,
    };
  }
}