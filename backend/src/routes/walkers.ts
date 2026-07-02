import { Router } from 'express';
import { ZodError } from 'zod';
import { walkerService } from '../services/walker.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createWalkerProfileSchema, updateWalkerProfileSchema, walkerSearchSchema } from '../schemas/walker.js';

export const walkersRouter = Router();

walkersRouter.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const filters = walkerSearchSchema.parse(req.query);
    const result = await walkerService.search(filters);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Walker search failed' });
  }
});

walkersRouter.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const walkers = await walkerService.list();
    res.json(walkers);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to fetch walkers' });
  }
});

walkersRouter.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const walker = await walkerService.getById(req.params.id);
    res.json(walker);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to fetch walker' });
  }
});

walkersRouter.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createWalkerProfileSchema.parse({ ...req.body, userId: req.user!.userId });
    const walker = await walkerService.create(data);
    res.status(201).json(walker);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to create walker profile' });
  }
});

walkersRouter.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = updateWalkerProfileSchema.parse(req.body);
    const walker = await walkerService.update(req.params.id, data);
    res.json(walker);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to update walker profile' });
  }
});

walkersRouter.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await walkerService.delete(req.params.id);
    res.json({ message: 'Walker profile deleted' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to delete walker profile' });
  }
});
