import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(createPaymentDto: CreatePaymentDto) {
    try {
      const { amount, currency = 'usd', metadata } = createPaymentDto;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      const { customerId, priceId, metadata } = createSubscriptionDto;

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: metadata || {},
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Subscription created: ${subscription.id}`);

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice?.payment_intent;
      
      return {
        subscriptionId: subscription.id,
        clientSecret: typeof paymentIntent === 'string' ? null : paymentIntent?.client_secret,
      };
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async createCustomer(email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      this.logger.log(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      this.logger.log(`Webhook received: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Update user's subscription or credits based on payment
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    
    if (paymentIntent.metadata?.userId) {
      // Handle one-time payment for credits or features
      // Update user record in database
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    
    if (subscription.metadata?.userId) {
      const userId = subscription.metadata.userId;
      const tier = subscription.metadata?.tier || 'PRO';
      
      // Update user's subscription in database
      await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubId: subscription.id,
          status: subscription.status.toUpperCase() as any,
          tier: tier as any,
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
        },
        create: {
          userId,
          stripeSubId: subscription.id,
          status: subscription.status.toUpperCase() as any,
          tier: tier as any,
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
        },
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    
    if (subscription.metadata?.userId) {
      const userId = subscription.metadata.userId;
      
      // Update subscription status to cancelled
      await this.prisma.subscription.updateMany({
        where: { 
          userId,
          stripeSubId: subscription.id 
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
    
    if (invoice.subscription && typeof invoice.subscription === 'string') {
      // Fetch the subscription to get metadata
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
      
      if (subscription.metadata?.userId) {
        // Update subscription status and period
        await this.handleSubscriptionUpdated(subscription);
      }
    }
  }

  async getPrices() {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      return prices.data.map(price => ({
        id: price.id,
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        interval: price.recurring?.interval,
        product: {
          id: (price.product as Stripe.Product).id,
          name: (price.product as Stripe.Product).name,
          description: (price.product as Stripe.Product).description,
        },
      }));
    } catch (error) {
      this.logger.error('Error fetching prices:', error);
      throw error;
    }
  }
}