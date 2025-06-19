import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport } from '@prisma/client';

export class CreateTeamDto {
  @ApiProperty({ example: 'nfl-kc-chiefs' })
  @IsString()
  externalId: string;

  @ApiProperty({ example: 'Kansas City Chiefs' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'KC' })
  @IsString()
  abbreviation: string;

  @ApiProperty({ enum: Sport, example: Sport.NFL })
  @IsEnum(Sport)
  sport: Sport;
}