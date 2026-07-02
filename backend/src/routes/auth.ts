import { Router } from 'express';
import { ZodError } from 'zod';
import { authService } from '../services/auth.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: result.user, token: result.token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: result.user, token: result.token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Login failed' });
  }
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const result = await authService.getCurrentUser(req.user.userId);
    res.json(result);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to get user' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});
