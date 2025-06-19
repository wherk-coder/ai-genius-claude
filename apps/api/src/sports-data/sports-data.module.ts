import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SportsDataService } from './sports-data.service';
import { SportsDataController } from './sports-data.controller';
import { OddsService } from './odds.service';
import { WebhookService } from './webhook.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SportsDataController],
  providers: [SportsDataService, OddsService, WebhookService],
  exports: [SportsDataService, OddsService, WebhookService],
})
export class SportsDataModule {}