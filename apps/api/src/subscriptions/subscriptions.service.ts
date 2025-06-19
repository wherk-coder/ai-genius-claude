import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionTier, SubscriptionStatus, Sport, Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    // Check if user already has a subscription
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has a subscription');
    }

    try {
      const subscription = await this.prisma.subscription.create({
        data: {
          ...createSubscriptionDto,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return subscription;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Subscription with this Stripe ID already exists');
        }
      }
      throw error;
    }
  }

  async findUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      // Return default free subscription if none exists
      return {
        userId,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        sportPackages: [],
        startDate: new Date(),
        endDate: null,
        stripeCustomerId: null,
        stripeSubId: null,
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return subscription;
  }

  async updateSubscription(userId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    try {
      const subscription = await this.prisma.subscription.update({
        where: { userId },
        data: updateSubscriptionDto,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return subscription;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Subscription not found');
        }
      }
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.findUserSubscription(userId);
    
    if (!subscription || subscription.tier === SubscriptionTier.FREE) {
      throw new BadRequestException('No active paid subscription to cancel');
    }

    return this.updateSubscription(userId, {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: new Date().toISOString(),
    });
  }

  async addSportPackage(userId: string, sport: Sport) {
    const subscription = await this.findUserSubscription(userId);
    
    if (subscription.tier === SubscriptionTier.FREE) {
      throw new BadRequestException('Upgrade to Plus or Premium to add sport packages');
    }

    const currentPackages = subscription.sportPackages as Sport[] || [];
    if (currentPackages.includes(sport)) {
      throw new BadRequestException(`Already subscribed to ${sport} package`);
    }

    return this.updateSubscription(userId, {
      sportPackages: [...currentPackages, sport],
    });
  }

  async removeSportPackage(userId: string, sport: Sport) {
    const subscription = await this.findUserSubscription(userId);
    const currentPackages = subscription.sportPackages as Sport[] || [];
    
    if (!currentPackages.includes(sport)) {
      throw new BadRequestException(`Not subscribed to ${sport} package`);
    }

    return this.updateSubscription(userId, {
      sportPackages: currentPackages.filter(pkg => pkg !== sport),
    });
  }

  async getSubscriptionTiers() {
    return {
      FREE: {
        name: 'Free',
        price: 0,
        features: [
          'Basic bet tracking',
          'Limited daily recommendations',
          'Community insights',
          'Ad-supported experience',
        ],
        limits: {
          dailyRecommendations: 3,
          betsPerMonth: 50,
          analyticsHistory: 30, // days
        },
      },
      PLUS: {
        name: 'Plus',
        price: 79, // monthly
        setupFee: 99,
        features: [
          'Complete feature access',
          'Ad-free experience',
          'Personal AI analyst',
          'Receipt scanner',
          'Unlimited bet tracking',
          'Full analytics dashboard',
        ],
        limits: {
          dailyRecommendations: -1, // unlimited
          betsPerMonth: -1, // unlimited
          analyticsHistory: -1, // unlimited
        },
      },
      PREMIUM: {
        name: 'Premium',
        price: 129, // monthly
        setupFee: 99,
        features: [
          'Everything in Plus',
          'Advanced AI models',
          'Custom model builder',
          'Priority support',
          'Early access to new features',
          'Advanced correlation analysis',
        ],
        limits: {
          dailyRecommendations: -1,
          betsPerMonth: -1,
          analyticsHistory: -1,
        },
      },
    };
  }

  async getSportPackages() {
    return {
      NFL: { name: 'NFL Package', price: 19.99 },
      NBA: { name: 'NBA Package', price: 19.99 },
      MLB: { name: 'MLB Package', price: 19.99 },
      NHL: { name: 'NHL Package', price: 19.99 },
      SOCCER: { name: 'Soccer Package', price: 19.99 },
      TENNIS: { name: 'Tennis Package', price: 19.99 },
      GOLF: { name: 'Golf Package', price: 19.99 },
      MMA: { name: 'MMA Package', price: 19.99 },
      BOXING: { name: 'Boxing Package', price: 19.99 },
      RACING: { name: 'Racing Package', price: 19.99 },
    };
  }

  async checkSubscriptionAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.findUserSubscription(userId);
    
    switch (feature) {
      case 'unlimited_bets':
        return subscription.tier !== SubscriptionTier.FREE;
      
      case 'ai_analyst':
        return subscription.tier !== SubscriptionTier.FREE;
      
      case 'receipt_scanner':
        return subscription.tier !== SubscriptionTier.FREE;
      
      case 'custom_models':
        return subscription.tier === SubscriptionTier.PREMIUM;
      
      case 'advanced_analytics':
        return subscription.tier !== SubscriptionTier.FREE;
      
      default:
        return true; // Default to allowing access for unknown features
    }
  }

  async getUsageStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      betsThisMonth,
      recommendationsToday,
      subscription,
    ] = await Promise.all([
      this.prisma.bet.count({
        where: {
          userId,
          placedAt: {
            gte: startOfMonth,
          },
        },
      }),
      this.prisma.insight.count({
        where: {
          userId,
          type: 'bet_recommendation',
          createdAt: {
            gte: startOfDay,
          },
        },
      }),
      this.findUserSubscription(userId),
    ]);

    const tiers = await this.getSubscriptionTiers();
    const currentTier = tiers[subscription.tier];

    return {
      subscription: subscription.tier,
      usage: {
        betsThisMonth,
        recommendationsToday,
      },
      limits: currentTier.limits,
      hasUnlimitedAccess: subscription.tier !== SubscriptionTier.FREE,
    };
  }

  // Stripe webhook handlers (to be implemented when Stripe is set up)
  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutCompleted(event.data.object);
      
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data.object);
      
      case 'customer.subscription.deleted':
        return this.handleSubscriptionCancelled(event.data.object);
      
      case 'invoice.payment_failed':
        return this.handlePaymentFailed(event.data.object);
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: any) {
    // Implementation for when user completes payment
    console.log('Checkout completed:', session);
  }

  private async handleSubscriptionUpdated(subscription: any) {
    // Implementation for subscription updates
    console.log('Subscription updated:', subscription);
  }

  private async handleSubscriptionCancelled(subscription: any) {
    // Implementation for subscription cancellation
    console.log('Subscription cancelled:', subscription);
  }

  private async handlePaymentFailed(invoice: any) {
    // Implementation for failed payments
    console.log('Payment failed:', invoice);
  }
}