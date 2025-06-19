import {
  Controller,
  Post,
  Body,
  Headers,
  RawBody,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for one-time payment' })
  async createPaymentIntent(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ) {
    return this.paymentsService.createPaymentIntent({
      ...createPaymentDto,
      metadata: {
        ...createPaymentDto.metadata,
        userId: req.user.userId,
      },
    });
  }

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a subscription for recurring payments' })
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req: any,
  ) {
    return this.paymentsService.createSubscription({
      ...createSubscriptionDto,
      metadata: {
        ...createSubscriptionDto.metadata,
        userId: req.user.userId,
      },
    });
  }

  @Post('create-customer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe customer' })
  async createCustomer(@Request() req: any) {
    return this.paymentsService.createCustomer(
      req.user.email,
      req.user.name,
    );
  }

  @Get('prices')
  @ApiOperation({ summary: 'Get available subscription prices' })
  async getPrices() {
    return this.paymentsService.getPrices();
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() payload: Buffer,
  ) {
    return this.paymentsService.handleWebhook(signature, payload);
  }
}