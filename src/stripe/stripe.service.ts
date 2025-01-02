import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia', // Version corrigée
    });
  }

  async createPaymentIntent(amount: number, currency: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Payment failed', error },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
