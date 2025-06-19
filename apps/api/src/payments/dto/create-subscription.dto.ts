import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Stripe price ID for the subscription' })
  @IsString()
  priceId: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the subscription' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}