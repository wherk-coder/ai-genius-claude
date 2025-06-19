import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService, BettingInsight, NaturalLanguageBet, BettingPattern } from './ai.service';
import { CreateInsightDto, ParseBetDto } from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('insights')
  @ApiOperation({ summary: 'Get personalized betting insights' })
  @ApiResponse({ status: 200, description: 'Betting insights generated successfully' })
  async getBettingInsights(@Request() req: any): Promise<BettingInsight[]> {
    try {
      return await this.aiService.generateBettingInsights(req.user.userId);
    } catch (error) {
      throw new HttpException(
        'Failed to generate insights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('parse-bet')
  @ApiOperation({ summary: 'Parse natural language betting input' })
  @ApiResponse({ status: 200, description: 'Bet parsed successfully' })
  async parseNaturalLanguageBet(
    @Request() req: any,
    @Body() parseBetDto: ParseBetDto,
  ): Promise<NaturalLanguageBet | null> {
    try {
      return await this.aiService.parseNaturalLanguageBet(
        parseBetDto.input,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to parse bet input',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('patterns')
  @ApiOperation({ summary: 'Identify betting patterns' })
  @ApiResponse({ status: 200, description: 'Betting patterns identified' })
  async getBettingPatterns(@Request() req: any): Promise<BettingPattern[]> {
    try {
      return await this.aiService.identifyBettingPatterns(req.user.userId);
    } catch (error) {
      throw new HttpException(
        'Failed to identify patterns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('opportunities')
  @ApiOperation({ summary: 'Get smart betting opportunities' })
  @ApiResponse({ status: 200, description: 'Betting opportunities generated' })
  async getBettingOpportunities(@Request() req: any): Promise<BettingInsight[]> {
    try {
      return await this.aiService.generateBettingOpportunities(req.user.userId);
    } catch (error) {
      throw new HttpException(
        'Failed to generate opportunities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('performance-analysis')
  @ApiOperation({ summary: 'Get AI-powered performance analysis' })
  @ApiResponse({ status: 200, description: 'Performance analysis completed' })
  async getPerformanceAnalysis(@Request() req: any) {
    try {
      return await this.aiService.analyzePerformance(req.user.userId);
    } catch (error) {
      throw new HttpException(
        'Failed to analyze performance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('insights')
  @ApiOperation({ summary: 'Create custom insight' })
  @ApiResponse({ status: 201, description: 'Insight created successfully' })
  async createInsight(
    @Request() req: any,
    @Body() createInsightDto: CreateInsightDto,
  ) {
    // This would save custom insights to the database
    // For now, return the input as confirmation
    return {
      id: `insight_${Date.now()}`,
      userId: req.user.userId,
      ...createInsightDto,
      createdAt: new Date(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check AI service health' })
  @ApiResponse({ status: 200, description: 'AI service status' })
  async checkHealth() {
    try {
      const isHealthy = await this.aiService.isHealthy();
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'OpenAI',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'OpenAI',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}