import { Router } from 'express';
import { ZodError } from 'zod';
import { walkService } from '../services/walk.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createWalkSchema, updateWalkSchema } from '../schemas/walk.js';

export const walksRouter = Router();
walksRouter.use(authenticate);

walksRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const walks = await walkService.list(req.user!.userId, req.user!.role, req.query as any);
    res.json(walks);
  } catch (error) {
    console.error('Get walks error:', error);
    res.status(500).json({ error: 'Failed to fetch walks' });
  }
});

walksRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const walk = await walkService.getById(req.user!.userId, req.user!.role, req.params.id);
    res.json(walk);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to fetch walk' });
  }
});

walksRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createWalkSchema.parse(req.body);
    const walk = await walkService.create(req.user!.userId, data);
    res.status(201).json(walk);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to create walk' });
  }
});

walksRouter.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = updateWalkSchema.parse(req.body);
    const walk = await walkService.update(req.params.id, data);
    res.json(walk);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to update walk' });
  }
});

walksRouter.post('/:id/start', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const walk = await walkService.start(req.params.id);
    res.json(walk);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to start walk' });
  }
});

walksRouter.post('/:id/end', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const walk = await walkService.end(req.params.id);
    res.json(walk);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to end walk' });
  }
});

walksRouter.post('/:id/confirm', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const walk = await walkService.confirm(req.params.id);
    res.json(walk);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to confirm walk' });
  }
});

walksRouter.post('/:id/cancel', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const walk = await walkService.cancel(req.params.id);
    res.json(walk);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to cancel walk' });
  }
});

walksRouter.post('/:id/complete', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const walk = await walkService.end(req.params.id);
    res.json(walk);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to complete walk' });
  }
});

walksRouter.patch('/:walkId/attendance/:dogId', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await walkService.toggleAttendance(req.params.walkId, req.params.dogId, req.body.attended);
    res.json({ message: 'Attendance updated' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to update attendance' });
  }
});

walksRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await walkService.remove(req.params.id);
    res.json({ message: 'Walk deleted' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to delete walk' });
  }
});
