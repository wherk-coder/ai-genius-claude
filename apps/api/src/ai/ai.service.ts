import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

export interface BettingInsight {
  type: 'performance' | 'recommendation' | 'risk_management' | 'market_analysis';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export interface NaturalLanguageBet {
  description: string;
  type: 'STRAIGHT' | 'PARLAY' | 'PROP';
  sport: string;
  amount?: number;
  odds?: string;
  confidence: number;
  extractedEntities: {
    teams?: string[];
    player?: string;
    betType?: string;
    handicap?: number;
    total?: number;
  };
}

export interface BettingPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  avgReturn: number;
  recommendation: string;
  significance: 'low' | 'medium' | 'high';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  /**
   * Generate personalized betting insights based on user's betting history
   */
  async generateBettingInsights(userId: string): Promise<BettingInsight[]> {
    try {
      // Get user's betting data
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          bets: {
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: {
              betLegs: true,
            },
          },
        },
      });

      if (!user || user.bets.length === 0) {
        return this.getDefaultInsights();
      }

      // Prepare betting data for AI analysis
      const bettingData = this.prepareBettingDataForAI(user.bets);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert sports betting analyst. Analyze the user's betting history and provide actionable insights. 
            Focus on patterns, performance metrics, risk management, and strategic recommendations.
            Return insights as a JSON array with the structure: {type, title, description, confidence, actionable, priority}.`,
          },
          {
            role: 'user',
            content: `Analyze this betting data and provide 3-5 key insights: ${JSON.stringify(bettingData)}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return this.getDefaultInsights();
      }

      try {
        const insights = JSON.parse(response);
        return Array.isArray(insights) ? insights : this.getDefaultInsights();
      } catch {
        // If JSON parsing fails, create insights from the text response
        return this.parseTextInsights(response);
      }
    } catch (error) {
      this.logger.error('Failed to generate betting insights', error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Parse natural language betting input into structured bet data
   */
  async parseNaturalLanguageBet(input: string, userId: string): Promise<NaturalLanguageBet | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a sports betting parser. Extract betting information from natural language input.
            Return a JSON object with: {description, type, sport, amount, odds, confidence, extractedEntities}.
            Types: STRAIGHT, PARLAY, PROP. Sports: NFL, NBA, MLB, NHL, NCAAF, NCAAB, Soccer, Tennis, Golf, MMA, Boxing.
            Confidence should be 0-1 based on how clear the input is.`,
          },
          {
            role: 'user',
            content: `Parse this betting input: "${input}"`,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return null;

      try {
        return JSON.parse(response);
      } catch {
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to parse natural language bet', error);
      return null;
    }
  }

  /**
   * Identify patterns in user's betting behavior
   */
  async identifyBettingPatterns(userId: string): Promise<BettingPattern[]> {
    try {
      const bets = await this.prisma.bet.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          betLegs: true,
        },
      });

      if (bets.length < 10) {
        return [];
      }

      // Analyze patterns using AI
      const bettingData = this.prepareBettingDataForAI(bets);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a data analyst specializing in sports betting patterns. 
            Identify significant patterns in betting behavior, including preferred sports, bet types, timing, and success rates.
            Return patterns as JSON array: {pattern, frequency, successRate, avgReturn, recommendation, significance}.`,
          },
          {
            role: 'user',
            content: `Identify betting patterns in this data: ${JSON.stringify(bettingData)}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      try {
        const patterns = JSON.parse(response);
        return Array.isArray(patterns) ? patterns : [];
      } catch {
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to identify betting patterns', error);
      return [];
    }
  }

  /**
   * Generate smart betting opportunity notifications
   */
  async generateBettingOpportunities(userId: string): Promise<BettingInsight[]> {
    try {
      // Get user preferences and patterns
      const userPatterns = await this.identifyBettingPatterns(userId);
      const recentBets = await this.prisma.bet.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      // This would typically integrate with live odds APIs
      // For now, we'll generate AI-based recommendations
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a sports betting opportunity detector. Based on user patterns and current market conditions,
            suggest betting opportunities that align with the user's successful patterns and risk tolerance.
            Return opportunities as JSON array with BettingInsight structure.`,
          },
          {
            role: 'user',
            content: `Generate betting opportunities based on these patterns: ${JSON.stringify(userPatterns.slice(0, 3))}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      try {
        const opportunities = JSON.parse(response);
        return Array.isArray(opportunities) ? opportunities : [];
      } catch {
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to generate betting opportunities', error);
      return [];
    }
  }

  /**
   * Analyze betting performance and provide recommendations
   */
  async analyzePerformance(userId: string): Promise<{
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      const bets = await this.prisma.bet.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      if (bets.length === 0) {
        return {
          summary: 'No betting history available for analysis.',
          strengths: [],
          weaknesses: [],
          recommendations: ['Start with small bets to build your profile', 'Focus on sports you know well'],
          riskLevel: 'low',
        };
      }

      const bettingData = this.prepareBettingDataForAI(bets);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional sports betting coach. Analyze performance data and provide constructive feedback.
            Return analysis as JSON: {summary, strengths, weaknesses, recommendations, riskLevel}.`,
          },
          {
            role: 'user',
            content: `Analyze this betting performance: ${JSON.stringify(bettingData)}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return this.getDefaultPerformanceAnalysis();
      }

      try {
        return JSON.parse(response);
      } catch {
        return this.getDefaultPerformanceAnalysis();
      }
    } catch (error) {
      this.logger.error('Failed to analyze performance', error);
      return this.getDefaultPerformanceAnalysis();
    }
  }

  /**
   * Helper methods
   */
  private prepareBettingDataForAI(bets: any[]) {
    return bets.map(bet => ({
      type: bet.type,
      sport: bet.sport,
      amount: bet.amount,
      odds: bet.odds,
      status: bet.status,
      createdAt: bet.createdAt,
      description: bet.description,
      legs: bet.betLegs?.length || 0,
    }));
  }

  private getDefaultInsights(): BettingInsight[] {
    return [
      {
        type: 'performance',
        title: 'Track Your Progress',
        description: 'Continue building your betting history to receive personalized insights.',
        confidence: 1.0,
        actionable: true,
        priority: 'medium',
      },
      {
        type: 'risk_management',
        title: 'Bankroll Management',
        description: 'Never bet more than 1-2% of your total bankroll on a single wager.',
        confidence: 1.0,
        actionable: true,
        priority: 'high',
      },
    ];
  }

  private parseTextInsights(text: string): BettingInsight[] {
    // Simple text-based insight extraction as fallback
    return [
      {
        type: 'recommendation',
        title: 'AI Analysis',
        description: text.substring(0, 200) + '...',
        confidence: 0.8,
        actionable: true,
        priority: 'medium',
      },
    ];
  }

  private getDefaultPerformanceAnalysis() {
    return {
      summary: 'Build more betting history for detailed analysis.',
      strengths: [],
      weaknesses: [],
      recommendations: ['Focus on consistent bet sizing', 'Track your performance regularly'],
      riskLevel: 'medium' as const,
    };
  }

  /**
   * Health check for AI service
   */
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.openai) return false;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });

      return !!completion.choices[0]?.message?.content;
    } catch {
      return false;
    }
  }
}