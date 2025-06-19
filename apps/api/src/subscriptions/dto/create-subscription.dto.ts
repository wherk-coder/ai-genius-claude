import { IsEnum, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionTier, SubscriptionStatus, Sport } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: SubscriptionTier, example: SubscriptionTier.PLUS })
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @ApiProperty({ required: false, example: 'cus_stripe123456' })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiProperty({ required: false, example: 'sub_stripe123456' })
  @IsOptional()
  @IsString()
  stripeSubId?: string;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    type: [String], 
    enum: Sport, 
    required: false,
    example: [Sport.NFL, Sport.NBA]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Sport, { each: true })
  sportPackages?: Sport[];
}