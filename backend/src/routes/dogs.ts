import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import type { CreateDogRequest, UpdateDogRequest } from '@dogwalking/shared';

export const dogsRouter = Router();

// All routes require authentication
dogsRouter.use(authenticate);

// Get all dogs
dogsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { ownerId } = req.query;

    // If user is owner, they can only see their own dogs
    const whereClause: any = {};
    if (req.user!.role === 'OWNER') {
      whereClause.ownerId = req.user!.userId;
    } else if (ownerId) {
      whereClause.ownerId = ownerId as string;
    }

    const dogs = await prisma.dog.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        rates: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(dogs);
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// Get dog by ID
dogsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const dog = await prisma.dog.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        rates: {
          orderBy: { effectiveFrom: 'desc' }
        }
      }
    });

    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Owners can only view their own dogs
    if (req.user!.role === 'OWNER' && dog.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(dog);
  } catch (error) {
    console.error('Get dog error:', error);
    res.status(500).json({ error: 'Failed to fetch dog' });
  }
});

// Create dog (admin only)
dogsRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body as CreateDogRequest;

    const dog = await prisma.dog.create({
      data: {
        name: data.name,
        breed: data.breed,
        age: data.age,
        weight: data.weight,
        ownerId: data.ownerId,
        medicalNotes: data.medicalNotes,
        emergencyContact: data.emergencyContact,
        photoUrl: data.photoUrl
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json(dog);
  } catch (error) {
    console.error('Create dog error:', error);
    res.status(500).json({ error: 'Failed to create dog' });
  }
});

// Update dog (admin only)
dogsRouter.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateDogRequest;

    const dog = await prisma.dog.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.breed !== undefined && { breed: data.breed }),
        ...(data.age !== undefined && { age: data.age }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.ownerId && { ownerId: data.ownerId }),
        ...(data.medicalNotes !== undefined && { medicalNotes: data.medicalNotes }),
        ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl })
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json(dog);
  } catch (error) {
    console.error('Update dog error:', error);
    res.status(500).json({ error: 'Failed to update dog' });
  }
});

// Delete dog (admin only)
dogsRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.dog.delete({
      where: { id }
    });

    res.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Delete dog error:', error);
    res.status(500).json({ error: 'Failed to delete dog' });
  }
});

