import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import Stripe from 'stripe';
// import { PaymentService } from './payment.service';
import { RawRequest } from 'src/interfaces/raw-request.interface';

@Controller('stripe')
export class StripeController {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia', // Version corrigée
  });

//constructor(private readonly paymentService: PaymentService) {}
/*
  @Post('webhook')
  async handleStripeWebhook(@Req() request: RawRequest, @Res() response) {
    const sig = request.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request.rawBody, // Utilise rawBody ajouté par le middleware
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error('Webhook error:', err.message);
      return response.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }

    // Gestion des événements Stripe
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Stocke les paiements réussis dans la base de données
      // await this.paymentService.savePayment({
      //   id: paymentIntent.id,
      //   amount: paymentIntent.amount,
      //   currency: paymentIntent.currency,
      //   status: paymentIntent.status,
      //   customerEmail: paymentIntent.receipt_email || 'N/A',
      // });

      console.log('PaymentIntent was successful:', paymentIntent);
    }

    response.status(HttpStatus.OK).json({ received: true });
  }
    */
}
