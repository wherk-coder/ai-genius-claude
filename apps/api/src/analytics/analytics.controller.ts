import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  @ApiOperation({ summary: 'Get comprehensive user betting analytics' })
  getUserAnalytics(@Request() req: any) {
    return this.analyticsService.getUserAnalytics(req.user.userId);
  }

  @Get('trends')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute for heavy computation
  @ApiOperation({ summary: 'Get betting trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  getBettingTrends(
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getBettingTrends(req.user.userId, days);
  }

  @Get('sports')
  @ApiOperation({ summary: 'Get performance breakdown by sport' })
  getSportBreakdown(@Request() req: any) {
    return this.analyticsService.getSportBreakdown(req.user.userId);
  }

  @Get('bet-types')
  @ApiOperation({ summary: 'Get performance analysis by bet type' })
  getBetTypeAnalysis(@Request() req: any) {
    return this.analyticsService.getBetTypeAnalysis(req.user.userId);
  }

  @Get('bankroll')
  @ApiOperation({ summary: 'Get bankroll history over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 90)' })
  getBankrollHistory(
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getBankrollHistory(req.user.userId, days);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get AI-generated betting insights and recommendations' })
  getInsights(@Request() req: any) {
    return this.analyticsService.getInsights(req.user.userId);
  }
}