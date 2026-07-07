import { Router } from 'express';
import { createCheckoutSession } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Checkout Session Route
router.post('/create-checkout-session', authenticate, createCheckoutSession);

export default router;