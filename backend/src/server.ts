import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { dogsRouter } from './routes/dogs.js';
import { walksRouter } from './routes/walks.js';
import { invitationsRouter } from './routes/invitations.js';
import { ratesRouter } from './routes/rates.js';
import { billingRouter } from './routes/billing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/dogs', dogsRouter);
app.use('/api/walks', walksRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/billing', billingRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Prisma Studio: npx prisma studio`);
});

