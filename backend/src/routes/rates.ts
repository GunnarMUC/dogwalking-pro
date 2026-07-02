import { Router } from 'express';
import { ZodError } from 'zod';
import { rateService } from '../services/rate.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createRateSchema } from '../schemas/billing.js';

export const ratesRouter = Router();
ratesRouter.use(authenticate);

ratesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const rates = await rateService.list(req.query.dogId as string);
    res.json(rates);
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

ratesRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createRateSchema.parse(req.body);
    const rate = await rateService.create(data);
    res.status(201).json(rate);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to create rate' });
  }
});

ratesRouter.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const rate = await rateService.update(req.params.id, req.body);
    res.json(rate);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to update rate' });
  }
});

ratesRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await rateService.delete(req.params.id);
    res.json({ message: 'Rate deleted' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to delete rate' });
  }
});
