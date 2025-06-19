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

  @ApiProperty({ example: 'clv123home456' })
  @IsString()
  homeTeamId: string;

  @ApiProperty({ example: 'clv123away456' })
  @IsString()
  awayTeamId: string;

  @ApiProperty({ example: '2024-01-15T18:00:00Z' })
  @IsDateString()
  startTime: string;

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

  @ApiProperty({ 
    required: false,
    example: {
      spread: { home: -3.5, away: 3.5 },
      moneyline: { home: -180, away: 155 },
      total: { over: 47.5, under: 47.5 }
    }
  })
  @IsOptional()
  @IsObject()
  odds?: any;

  @ApiProperty({ 
    required: false,
    example: {
      player_props: [
        { player: 'Patrick Mahomes', type: 'passing_yards', line: 289.5 }
      ]
    }
  })
  @IsOptional()
  @IsObject()
  props?: any;
}