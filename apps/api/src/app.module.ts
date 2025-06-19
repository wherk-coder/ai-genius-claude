import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BetsModule } from './bets/bets.module';
import { SportsModule } from './sports/sports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { AiModule } from './ai/ai.module';
import { SportsDataModule } from './sports-data/sports-data.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,   // 1 minute
        limit: 20,    // 20 requests per minute for heavy operations
      },
      {
        name: 'medium', 
        ttl: 60000,   // 1 minute
        limit: 100,   // 100 requests per minute standard
      },
      {
        name: 'long',
        ttl: 300000,  // 5 minutes
        limit: 1000,  // 1000 requests per 5 minutes
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    BetsModule,
    SportsModule,
    AnalyticsModule,
    SubscriptionsModule,
    PaymentsModule,
    AiModule,
    SportsDataModule,
    NotificationsModule,
  ],
})
export class AppModule {}