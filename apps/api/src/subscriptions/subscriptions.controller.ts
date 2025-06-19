import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Sport } from '@prisma/client';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('tiers')
  @ApiOperation({ summary: 'Get available subscription tiers and pricing' })
  getSubscriptionTiers() {
    return this.subscriptionsService.getSubscriptionTiers();
  }

  @Get('sport-packages')
  @ApiOperation({ summary: 'Get available sport packages and pricing' })
  getSportPackages() {
    return this.subscriptionsService.getSportPackages();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription for user' })
  create(@Request() req: any, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(req.user.userId, createSubscriptionDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription' })
  findUserSubscription(@Request() req: any) {
    return this.subscriptionsService.findUserSubscription(req.user.userId);
  }

  @Get('me/usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user usage statistics and limits' })
  getUsageStats(@Request() req: any) {
    return this.subscriptionsService.getUsageStats(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user subscription' })
  update(@Request() req: any, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.updateSubscription(req.user.userId, updateSubscriptionDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel current user subscription' })
  cancel(@Request() req: any) {
    return this.subscriptionsService.cancelSubscription(req.user.userId);
  }

  @Post('me/sport-packages/:sport')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add sport package to subscription' })
  addSportPackage(@Request() req: any, @Param('sport') sport: Sport) {
    return this.subscriptionsService.addSportPackage(req.user.userId, sport);
  }

  @Delete('me/sport-packages/:sport')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove sport package from subscription' })
  removeSportPackage(@Request() req: any, @Param('sport') sport: Sport) {
    return this.subscriptionsService.removeSportPackage(req.user.userId, sport);
  }

  @Get('me/access/:feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has access to a specific feature' })
  checkFeatureAccess(@Request() req: any, @Param('feature') feature: string) {
    return this.subscriptionsService.checkSubscriptionAccess(req.user.userId, feature);
  }

  // Stripe webhook endpoint (will be implemented when Stripe is set up)
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  handleStripeWebhook(@Body() event: any) {
    return this.subscriptionsService.handleStripeWebhook(event);
  }
}