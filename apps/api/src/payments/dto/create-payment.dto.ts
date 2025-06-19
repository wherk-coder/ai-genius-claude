import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Payment amount in dollars', example: 9.99 })
  @IsNumber()
  @Min(0.50)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the payment' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}