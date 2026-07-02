import { Router } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

export const recurringRouter = Router();
recurringRouter.use(authenticate);

recurringRouter.get('/', requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const plans = await prisma.recurringWalkPlan.findMany({
      include: {
        dog: { select: { id: true, name: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    console.error('Get recurring plans error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring plans' });
  }
});

recurringRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { dogId, ownerId, dayOfWeek, time, duration } = req.body;
    const plan = await prisma.recurringWalkPlan.create({
      data: { dogId, ownerId, dayOfWeek, time, duration },
      include: {
        dog: { select: { id: true, name: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    console.error('Create recurring plan error:', error);
    res.status(500).json({ error: 'Failed to create recurring plan' });
  }
});

recurringRouter.patch('/:id/toggle', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const plan = await prisma.recurringWalkPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const updated = await prisma.recurringWalkPlan.update({
      where: { id: req.params.id },
      data: { active: !plan.active },
    });
    res.json(updated);
  } catch (error) {
    console.error('Toggle recurring plan error:', error);
    res.status(500).json({ error: 'Failed to toggle recurring plan' });
  }
});

recurringRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.recurringWalkPlan.delete({ where: { id: req.params.id } });
    res.json({ message: 'Recurring plan deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recurring plan' });
  }
});
