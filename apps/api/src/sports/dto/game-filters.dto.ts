import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport } from '@prisma/client';

export class GameFiltersDto {
  @ApiProperty({ enum: Sport, required: false })
  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @ApiProperty({ required: false, example: 'scheduled' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ required: false, example: 'clv123team456' })
  @IsOptional()
  @IsString()
  teamId?: string;
}