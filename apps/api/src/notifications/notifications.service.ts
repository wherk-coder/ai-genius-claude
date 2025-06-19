import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import * as cron from 'node-cron';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {
    this.initializeScheduledTasks();
  }

  private initializeScheduledTasks() {
    // Send weekly summaries every Sunday at 6 PM
    cron.schedule('0 18 * * 0', () => {
      this.sendWeeklySummaries();
    });
  }

  async sendWelcomeNotifications(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, subscription: true },
    });

    if (user) {
      await this.emailService.sendWelcomeEmail({
        name: user.name || 'Friend',
        email: user.email,
        subscriptionTier: user.subscription?.tier || 'FREE',
      });
    }
  }

  async sendBetConfirmation(betId: string): Promise<void> {
    const bet = await this.prisma.bet.findUnique({
      where: { id: betId },
      include: { user: true },
    });

    if (bet) {
      await this.emailService.sendBetConfirmationEmail({
        name: bet.user.name || 'Friend',
        email: bet.user.email,
        betType: bet.type,
        description: bet.description,
        amount: bet.amount,
        potentialPayout: bet.potentialPayout,
        odds: bet.odds,
        sportsbook: bet.sportsbook,
      });
    }
  }

  async sendWeeklySummaries(): Promise<void> {
    this.logger.log('Sending weekly summaries...');
    // Implementation for bulk weekly summaries
  }

  async updateUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { profile: { update: { notifications: preferences.enabled } } },
    });
  }
}