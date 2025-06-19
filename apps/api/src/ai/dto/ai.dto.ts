import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseBetDto {
  @ApiProperty({ 
    description: 'Natural language betting input',
    example: 'Put $50 on the Lakers to beat the Warriors by more than 5 points'
  })
  @IsString()
  @IsNotEmpty()
  input: string;
}

export class CreateInsightDto {
  @ApiProperty({ 
    description: 'Type of insight',
    enum: ['performance', 'recommendation', 'risk_management', 'market_analysis']
  })
  @IsEnum(['performance', 'recommendation', 'risk_management', 'market_analysis'])
  type: 'performance' | 'recommendation' | 'risk_management' | 'market_analysis';

  @ApiProperty({ description: 'Insight title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Insight description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'Confidence level (0-1)',
    minimum: 0,
    maximum: 1
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({ description: 'Whether insight is actionable' })
  @IsOptional()
  actionable?: boolean;

  @ApiProperty({ 
    description: 'Priority level',
    enum: ['low', 'medium', 'high']
  })
  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Additional data', required: false })
  @IsOptional()
  data?: any;
}