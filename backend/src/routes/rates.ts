import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import type { CreateRateRequest } from '@dogwalking/shared';

export const ratesRouter = Router();

// All routes require authentication
ratesRouter.use(authenticate);

// Get all rates
ratesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { dogId } = req.query;

    const whereClause: any = {};
    if (dogId) {
      whereClause.dogId = dogId as string;
    }

    const rates = await prisma.rate.findMany({
      where: whereClause,
      include: {
        dog: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { effectiveFrom: 'desc' }
    });

    res.json(rates);
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Create rate (admin only)
ratesRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body as CreateRateRequest;

    const rate = await prisma.rate.create({
      data: {
        dogId: data.dogId,
        hourlyRate: data.hourlyRate,
        effectiveFrom: new Date(data.effectiveFrom)
      },
      include: {
        dog: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(rate);
  } catch (error) {
    console.error('Create rate error:', error);
    res.status(500).json({ error: 'Failed to create rate' });
  }
});

// Update rate (admin only)
ratesRouter.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { hourlyRate, effectiveFrom } = req.body;

    const rate = await prisma.rate.update({
      where: { id },
      data: {
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) })
      },
      include: {
        dog: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json(rate);
  } catch (error) {
    console.error('Update rate error:', error);
    res.status(500).json({ error: 'Failed to update rate' });
  }
});

// Delete rate (admin only)
ratesRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.rate.delete({
      where: { id }
    });

    res.json({ message: 'Rate deleted successfully' });
  } catch (error) {
    console.error('Delete rate error:', error);
    res.status(500).json({ error: 'Failed to delete rate' });
  }
});

