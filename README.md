# QuickTask – Simple Task Manager Backend

QuickTask Backend is a TypeScript REST API for a simple SaaS task management app. It provides JWT authentication, Kanban-style task management, a free-tier task limit, and a Stripe-powered premium upgrade flow.

## Features

- User registration and login with JWT authentication
- Task CRUD for authenticated users
- Task status management with `To Do`, `In Progress`, and `Done`
- Free plan limit of 3 tasks per user
- Stripe checkout for a one-time premium upgrade
- Stripe webhook handling to mark users as premium after successful payment

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Payments: Stripe
- Authentication: JSON Web Tokens

## Project Structure

```text
prisma/
  schema.prisma
src/
  index.ts
  controllers/
	 authController.ts
	 paymentController.ts
	 taskController.ts
  middleware/
	 authMiddleware.ts
  routes/
	 authRoutes.ts
	 paymentRoutes.ts
	 taskRoutes.ts
```

## Prerequisites

Make sure you have the following installed:

- Node.js 18 or later
- A PostgreSQL database
- A Stripe test account

## Setup

1. Clone the repository.

   ```bash
   git clone https://github.com/Rakibislam22/quickTask-backend
   cd quickTask-backend
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root.

   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
   JWT_SECRET="your_super_secret_jwt_key"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   FRONTEND_URL="http://localhost:3000"
   PORT=5000
   ```

4. Generate the Prisma client and apply the schema.

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server.

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`.

## Available Scripts

- `npm run dev` - Start the app with Nodemon
- `npm run build` - Compile the TypeScript source
- `npm start` - Run the compiled server from `dist/index.js`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT

### Tasks

All task routes require authentication.

- `GET /api/tasks` - Fetch the current user's tasks
- `POST /api/tasks` - Create a new task, subject to the free-tier limit
- `PATCH /api/tasks/:taskId` - Update a task status
- `DELETE /api/tasks/:taskId` - Delete a task

### Payments

All payment routes except the webhook require authentication.

- `POST /api/payment/create-checkout-session` - Create a Stripe checkout session
- `POST /api/payment/webhook` - Receive Stripe webhook events

## Database Model

The Prisma schema includes:

- `User` - stores profile, email, password, and premium status
- `Task` - stores task title, optional description, status, and ownership

## Deployment Notes

This project can be deployed to platforms such as Render or Railway.

Recommended production build steps:

```bash
npm install && npx prisma generate && npm run build
```

Start command:

```bash
npm start
```

**Note:** For Stripe webhooks in production, make sure `STRIPE_WEBHOOK_SECRET` matches the webhook configuration in your Stripe dashboard.
