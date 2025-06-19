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
      include: {
        homeGames: {
          include: {
            awayTeam: true,
          },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        awayGames: {
          include: {
            homeTeam: true,
          },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  // Games
  async createGame(createGameDto: CreateGameDto) {
    try {
      return await this.prisma.game.create({
        data: createGameDto,
        include: {
          homeTeam: true,
          awayTeam: true,
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
        startTime: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        }
      },
      ...(filters?.teamId && {
        OR: [
          { homeTeamId: filters.teamId },
          { awayTeamId: filters.teamId },
        ]
      }),
    };

    return this.prisma.game.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findGameById(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
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
          homeTeam: true,
          awayTeam: true,
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
      startTime: {
        gt: new Date(),
      },
      ...(sport && { sport }),
    };

    return this.prisma.game.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        startTime: 'asc',
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
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getGameOdds(gameId: string) {
    const game = await this.findGameById(gameId);
    return {
      gameId: game.id,
      homeTeam: game.homeTeam.name,
      awayTeam: game.awayTeam.name,
      startTime: game.startTime,
      odds: game.odds,
      props: game.props,
    };
  }

  async updateGameOdds(gameId: string, odds: any) {
    return this.updateGame(gameId, { odds });
  }

  async getSportStats(sport: Sport) {
    const [totalGames, liveGames, upcomingGames, teams] = await Promise.all([
      this.prisma.game.count({ where: { sport } }),
      this.prisma.game.count({ where: { sport, status: 'live' } }),
      this.prisma.game.count({ 
        where: { 
          sport, 
          startTime: { gt: new Date() } 
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