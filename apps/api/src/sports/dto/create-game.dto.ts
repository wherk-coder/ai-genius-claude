import { IsEnum, IsString, IsDateString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport } from '@prisma/client';

export class CreateGameDto {
  @ApiProperty({ example: 'nfl-week1-kc-vs-buf' })
  @IsString()
  externalId: string;

  @ApiProperty({ enum: Sport, example: Sport.NFL })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ example: 'Kansas City Chiefs' })
  @IsString()
  homeTeam: string;

  @ApiProperty({ example: 'Buffalo Bills' })
  @IsString()
  awayTeam: string;

  @ApiProperty({ example: 'NFL' })
  @IsOptional()
  @IsString()
  league?: string;

  @ApiProperty({ example: '2024-01-15T18:00:00Z' })
  @IsDateString()
  gameTime: string;

  @ApiProperty({ example: 'scheduled' })
  @IsString()
  status: string;

  @ApiProperty({ required: false, example: 21 })
  @IsOptional()
  @IsNumber()
  homeScore?: number;

  @ApiProperty({ required: false, example: 14 })
  @IsOptional()
  @IsNumber()
  awayScore?: number;

  @ApiProperty({ required: false, example: 'Q3' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ required: false, example: '5:32' })
  @IsOptional()
  @IsString()
  timeRemaining?: string;

}