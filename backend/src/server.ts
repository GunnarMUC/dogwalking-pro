import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { dogsRouter } from './routes/dogs.js';
import { walksRouter } from './routes/walks.js';
import { walkersRouter } from './routes/walkers.js';
import { invitationsRouter } from './routes/invitations.js';
import { ratesRouter } from './routes/rates.js';
import { billingRouter } from './routes/billing.js';
import { dashboardRouter } from './routes/dashboard.js';
import { recurringRouter } from './routes/recurring.js';
import { PORT, FRONTEND_URL, NODE_ENV } from './config/env.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authLimiter, authRouter);
app.use('/api', globalLimiter);
app.use('/api/users', usersRouter);
app.use('/api/dogs', dogsRouter);
app.use('/api/walks', walksRouter);
app.use('/api/walkers', walkersRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/billing', billingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/recurring', recurringRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

interface AppError extends Error {
  status?: number;
  errors?: unknown[];
}

app.use((err: AppError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    console.error('Server error:', err);
  }

  res.status(status).json({
    error: message,
    ...(NODE_ENV === 'development' && err.errors ? { details: err.errors } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Prisma Studio: npx prisma studio`);
});

export default app;
