import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { stripeWebhook } from './controllers/paymentController';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// To handle Stripe webhook, we need to use express.raw() for the specific route
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// For other routes, we can use express.json() to parse JSON bodies
app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payment', paymentRoutes);

// Basic Route to test
app.get('/', (req: Request, res: Response) => {
  res.send('QuickTask Backend is running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});