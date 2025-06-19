import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @ApiProperty({ required: false, example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  cancelledAt?: string;
}