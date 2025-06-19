import { PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BetStatus } from '@prisma/client';
import { CreateBetDto } from './create-bet.dto';

export class UpdateBetDto extends PartialType(
  OmitType(CreateBetDto, ['betLegs'] as const)
) {
  @ApiProperty({ enum: BetStatus, required: false })
  @IsOptional()
  @IsEnum(BetStatus)
  status?: BetStatus;

  @ApiProperty({ required: false, example: 50.00 })
  @IsOptional()
  @IsNumber()
  actualPayout?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  settledAt?: string;
}