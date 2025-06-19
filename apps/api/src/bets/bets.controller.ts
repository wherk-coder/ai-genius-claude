import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BetFiltersDto } from './dto/bet-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('bets')
@Controller('bets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bet' })
  create(@Request() req: any, @Body() createBetDto: CreateBetDto) {
    return this.betsService.create(req.user.userId, createBetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user bets with optional filters' })
  @ApiQuery({ name: 'sport', required: false, enum: ['NFL', 'NBA', 'MLB', 'NHL', 'SOCCER'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'WON', 'LOST', 'PUSHED', 'CANCELLED'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAll(@Request() req: any, @Query() filters: BetFiltersDto) {
    const processedFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };
    return this.betsService.findAll(req.user.userId, processedFilters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user betting statistics' })
  getStats(@Request() req: any) {
    return this.betsService.getStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bet by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.betsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bet by ID' })
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateBetDto: UpdateBetDto,
  ) {
    return this.betsService.update(id, req.user.userId, updateBetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bet by ID' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.betsService.remove(id, req.user.userId);
  }
}