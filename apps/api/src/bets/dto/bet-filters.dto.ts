import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BetStatus, Sport } from '@prisma/client';

export class BetFiltersDto {
  @ApiProperty({ enum: Sport, required: false })
  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @ApiProperty({ enum: BetStatus, required: false })
  @IsOptional()
  @IsEnum(BetStatus)
  status?: BetStatus;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}