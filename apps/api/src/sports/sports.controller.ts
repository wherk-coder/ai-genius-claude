import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SportsService } from './sports.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameFiltersDto } from './dto/game-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Sport } from '@prisma/client';

@ApiTags('sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  // Teams endpoints
  @Post('teams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team (Admin only)' })
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.sportsService.createTeam(createTeamDto);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get all teams' })
  @ApiQuery({ name: 'sport', required: false, enum: Sport })
  findAllTeams(@Query('sport') sport?: Sport) {
    return this.sportsService.findAllTeams(sport);
  }

  @Get('teams/:id')
  @ApiOperation({ summary: 'Get team by ID with recent games' })
  findTeamById(@Param('id') id: string) {
    return this.sportsService.findTeamById(id);
  }

  // Games endpoints
  @Post('games')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game (Admin only)' })
  createGame(@Body() createGameDto: CreateGameDto) {
    return this.sportsService.createGame(createGameDto);
  }

  @Get('games')
  @ApiOperation({ summary: 'Get all games with optional filters' })
  @ApiQuery({ name: 'sport', required: false, enum: Sport })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  findAllGames(@Query() filters: GameFiltersDto) {
    const processedFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };
    return this.sportsService.findAllGames(processedFilters);
  }

  @Get('games/upcoming')
  @ApiOperation({ summary: 'Get upcoming games' })
  @ApiQuery({ name: 'sport', required: false, enum: Sport })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getUpcomingGames(
    @Query('sport') sport?: Sport,
    @Query('limit') limit?: number,
  ) {
    return this.sportsService.getUpcomingGames(sport, limit || 20);
  }

  @Get('games/live')
  @ApiOperation({ summary: 'Get live games' })
  @ApiQuery({ name: 'sport', required: false, enum: Sport })
  getLiveGames(@Query('sport') sport?: Sport) {
    return this.sportsService.getLiveGames(sport);
  }

  @Get('games/:id')
  @ApiOperation({ summary: 'Get game by ID with betting data' })
  findGameById(@Param('id') id: string) {
    return this.sportsService.findGameById(id);
  }

  @Patch('games/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update game by ID (Admin only)' })
  updateGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.sportsService.updateGame(id, updateGameDto);
  }

  @Get('games/:id/odds')
  @ApiOperation({ summary: 'Get current odds for a game' })
  getGameOdds(@Param('id') id: string) {
    return this.sportsService.getGameOdds(id);
  }

  @Patch('games/:id/odds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update game odds (Admin only)' })
  updateGameOdds(@Param('id') id: string, @Body() body: { odds: any }) {
    return this.sportsService.updateGameOdds(id, body.odds);
  }

  // Stats endpoints
  @Get(':sport/stats')
  @ApiOperation({ summary: 'Get statistics for a specific sport' })
  getSportStats(@Param('sport') sport: Sport) {
    return this.sportsService.getSportStats(sport);
  }
}