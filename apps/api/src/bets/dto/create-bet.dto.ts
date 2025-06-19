import { 
  IsEnum, 
  IsNumber, 
  IsString, 
  IsOptional, 
  IsArray, 
  ValidateNested, 
  Min,
  IsDateString 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BetType, Sport, BetStatus } from '@prisma/client';

export class CreateBetLegDto {
  @ApiProperty({ example: 'clv123abc456def' })
  @IsString()
  gameId: string;

  @ApiProperty({ example: 'Kansas City Chiefs -3.5' })
  @IsString()
  selection: string;

  @ApiProperty({ example: -110 })
  @IsNumber()
  odds: number;
}

export class CreateBetDto {
  @ApiProperty({ enum: BetType, example: BetType.STRAIGHT })
  @IsEnum(BetType)
  type: BetType;

  @ApiProperty({ enum: Sport, example: Sport.NFL })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ example: 25.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: -110 })
  @IsNumber()
  odds: number;

  @ApiProperty({ example: 'Kansas City Chiefs -3.5 vs Buffalo Bills' })
  @IsString()
  description: string;

  @ApiProperty({ required: false, example: 'bet123456' })
  @IsOptional()
  @IsString()
  betSlipId?: string;

  @ApiProperty({ required: false, example: 'DraftKings' })
  @IsOptional()
  @IsString()
  sportsbook?: string;

  @ApiProperty({ required: false, example: 'clv123receipt456' })
  @IsOptional()
  @IsString()
  receiptId?: string;

  @ApiProperty({ 
    type: [CreateBetLegDto], 
    required: false,
    description: 'For parlay bets - individual legs'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBetLegDto)
  betLegs?: CreateBetLegDto[];
}