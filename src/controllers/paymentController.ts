import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-06-24.dahlia'
});

// 1. Create Checkout Session
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.isPremium) {
      res.status(400).json({ message: 'User is already a premium member' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      client_reference_id: userId, // Very important: to track the user
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'QuickTask Premium - Unlimited Tasks',
            },
            unit_amount: 500, 
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Error creating checkout session', error });
  }
};

// 2. Stripe Webhook (Auto Update Premium Status)
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event;

  try {
    // Note: To verify webhook, req.body needs to be passed as a raw string
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId) {
      // Upgrade user to premium upon successful payment
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true },
      });
      console.log(`User ${userId} upgraded to Premium!`);
    }
  }

  res.status(200).json({ received: true });
};
