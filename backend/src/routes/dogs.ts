import { Router } from 'express';
import { ZodError } from 'zod';
import { dogService } from '../services/dog.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createDogSchema, updateDogSchema } from '../schemas/dog.js';

export const dogsRouter = Router();
dogsRouter.use(authenticate);

dogsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const dogs = await dogService.list(req.user!.userId, req.user!.role, req.query as any);
    res.json(dogs);
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

dogsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const dog = await dogService.getById(req.user!.userId, req.user!.role, req.params.id);
    res.json(dog);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to fetch dog' });
  }
});

dogsRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createDogSchema.parse(req.body);
    const dog = await dogService.create(data);
    res.status(201).json(dog);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to create dog' });
  }
});

dogsRouter.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = updateDogSchema.parse(req.body);
    const dog = await dogService.update(req.params.id, data);
    res.json(dog);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to update dog' });
  }
});

dogsRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await dogService.delete(req.params.id);
    res.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to delete dog' });
  }
});
