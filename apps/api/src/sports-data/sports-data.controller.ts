import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SportsDataService } from './sports-data.service';
import { WebhookService, GameUpdateWebhook, OddsUpdateWebhook } from './webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Sports Data')
@Controller('api/v1/sports-data')
export class SportsDataController {
  constructor(
    private readonly sportsDataService: SportsDataService,
    private readonly webhookService: WebhookService,
  ) {}

  /**
   * Get live games with real-time scores
   */
  @Get('live')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live games with real-time scores' })
  @ApiQuery({ name: 'sport', required: false, description: 'Filter by sport' })
  @ApiResponse({ status: 200, description: 'Live games retrieved successfully' })
  async getLiveGames(@Query('sport') sport?: string) {
    return this.sportsDataService.getLiveGames(sport);
  }

  /**
   * Get upcoming games with odds
   */
  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming games with odds' })
  @ApiQuery({ name: 'sport', required: false, description: 'Filter by sport' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days ahead (default: 7)' })
  @ApiResponse({ status: 200, description: 'Upcoming games retrieved successfully' })
  async getUpcomingGames(
    @Query('sport') sport?: string,
    @Query('days') days?: number,
  ) {
    return this.sportsDataService.getUpcomingGames(sport, days ? parseInt(days.toString()) : 7);
  }

  /**
   * Get completed games with results
   */
  @Get('completed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get completed games with results' })
  @ApiQuery({ name: 'sport', required: false, description: 'Filter by sport' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days back (default: 7)' })
  @ApiResponse({ status: 200, description: 'Completed games retrieved successfully' })
  async getCompletedGames(
    @Query('sport') sport?: string,
    @Query('days') days?: number,
  ) {
    return this.sportsDataService.getCompletedGames(sport, days ? parseInt(days.toString()) : 7);
  }

  /**
   * Get odds comparison for a specific game
   */
  @Get('games/:gameId/odds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get odds comparison for a specific game' })
  @ApiResponse({ status: 200, description: 'Odds comparison retrieved successfully' })
  async getGameOddsComparison(@Param('gameId') gameId: string) {
    return this.sportsDataService.getGameOddsComparison(gameId);
  }

  /**
   * Get trending games (most bet on)
   */
  @Get('trending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trending games (most bet on)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of games to return (default: 10)' })
  @ApiResponse({ status: 200, description: 'Trending games retrieved successfully' })
  async getTrendingGames(@Query('limit') limit?: number) {
    return this.sportsDataService.getTrendingGames(limit ? parseInt(limit.toString()) : 10);
  }

  /**
   * Get games by team
   */
  @Get('teams/:teamName/games')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get games by team name' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of games to return (default: 20)' })
  @ApiResponse({ status: 200, description: 'Team games retrieved successfully' })
  async getGamesByTeam(
    @Param('teamName') teamName: string,
    @Query('limit') limit?: number,
  ) {
    return this.sportsDataService.getGamesByTeam(teamName, limit ? parseInt(limit.toString()) : 20);
  }

  /**
   * Search games
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search games by team, league, or other criteria' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results (default: 20)' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchGames(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.sportsDataService.searchGames(query, limit ? parseInt(limit.toString()) : 20);
  }

  /**
   * Get sports statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sports statistics and overview' })
  @ApiResponse({ status: 200, description: 'Sports statistics retrieved successfully' })
  async getSportsStats() {
    return this.sportsDataService.getSportsStats();
  }

  /**
   * Force refresh odds for all sports
   */
  @Post('refresh-odds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Force refresh odds for all sports' })
  @ApiResponse({ status: 200, description: 'Odds refresh initiated successfully' })
  @HttpCode(HttpStatus.OK)
  async forceRefreshOdds() {
    return this.sportsDataService.forceRefreshOdds();
  }

  /**
   * Health check for sports data services
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for sports data services' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealthStatus() {
    return this.sportsDataService.getHealthStatus();
  }

  /**
   * Webhook endpoint for game updates
   */
  @Post('webhooks/game-update')
  @ApiOperation({ summary: 'Webhook for game updates from sports data provider' })
  @ApiResponse({ status: 200, description: 'Game update processed successfully' })
  @HttpCode(HttpStatus.OK)
  async handleGameUpdateWebhook(@Body() webhook: GameUpdateWebhook) {
    // In production, you'd want to validate the webhook signature
    // const signature = req.headers['x-webhook-signature'];
    // const isValid = this.webhookService.validateWebhookSignature(
    //   JSON.stringify(webhook), 
    //   signature, 
    //   process.env.WEBHOOK_SECRET
    // );
    // if (!isValid) throw new UnauthorizedException('Invalid webhook signature');

    await this.webhookService.handleGameUpdate(webhook);
    return { success: true, message: 'Game update processed' };
  }

  /**
   * Webhook endpoint for odds updates
   */
  @Post('webhooks/odds-update')
  @ApiOperation({ summary: 'Webhook for odds updates from sports data provider' })
  @ApiResponse({ status: 200, description: 'Odds update processed successfully' })
  @HttpCode(HttpStatus.OK)
  async handleOddsUpdateWebhook(@Body() webhook: OddsUpdateWebhook) {
    // In production, you'd want to validate the webhook signature
    await this.webhookService.handleOddsUpdate(webhook);
    return { success: true, message: 'Odds update processed' };
  }
}