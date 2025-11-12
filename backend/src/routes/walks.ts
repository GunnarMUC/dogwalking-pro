import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import type { CreateWalkRequest, UpdateWalkRequest, UpdateAttendanceRequest } from '@dogwalking/shared';

export const walksRouter = Router();

// All routes require authentication
walksRouter.use(authenticate);

// Get all walks
walksRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, dogId } = req.query;

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate as string,
        lte: endDate as string
      };
    }

    // If owner, filter by their dogs
    if (req.user!.role === 'OWNER') {
      const userDogs = await prisma.dog.findMany({
        where: { ownerId: req.user!.userId },
        select: { id: true }
      });
      const dogIds = userDogs.map(d => d.id);

      whereClause.attendances = {
        some: {
          dogId: { in: dogIds }
        }
      };
    } else if (dogId) {
      whereClause.attendances = {
        some: {
          dogId: dogId as string
        }
      };
    }

    const walks = await prisma.walk.findMany({
      where: whereClause,
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attendances: {
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
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(walks);
  } catch (error) {
    console.error('Get walks error:', error);
    res.status(500).json({ error: 'Failed to fetch walks' });
  }
});

// Get walk by ID
walksRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const walk = await prisma.walk.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attendances: {
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
        }
      }
    });

    if (!walk) {
      return res.status(404).json({ error: 'Walk not found' });
    }

    // Owners can only view walks that include their dogs
    if (req.user!.role === 'OWNER') {
      const userDogIds = await prisma.dog.findMany({
        where: { ownerId: req.user!.userId },
        select: { id: true }
      });
      const dogIds = userDogIds.map(d => d.id);
      
      const hasUserDog = walk.attendances.some(a => dogIds.includes(a.dogId));
      if (!hasUserDog) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(walk);
  } catch (error) {
    console.error('Get walk error:', error);
    res.status(500).json({ error: 'Failed to fetch walk' });
  }
});

// Create walk (admin only)
walksRouter.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body as CreateWalkRequest;

    const walk = await prisma.walk.create({
      data: {
        date: data.date,
        status: 'SCHEDULED',
        adminId: req.user!.userId,
        notes: data.notes,
        attendances: {
          create: data.dogIds.map(dogId => ({
            dogId,
            attended: false
          }))
        }
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attendances: {
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
        }
      }
    });

    res.status(201).json(walk);
  } catch (error) {
    console.error('Create walk error:', error);
    res.status(500).json({ error: 'Failed to create walk' });
  }
});

// Update walk (admin only)
walksRouter.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateWalkRequest;

    // If dogIds are provided, update attendances
    if (data.dogIds) {
      // Delete existing attendances
      await prisma.attendance.deleteMany({
        where: { walkId: id }
      });

      // Create new attendances
      await prisma.attendance.createMany({
        data: data.dogIds.map(dogId => ({
          walkId: id,
          dogId,
          attended: false
        }))
      });
    }

    const walk = await prisma.walk.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime })
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attendances: {
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
        }
      }
    });

    res.json(walk);
  } catch (error) {
    console.error('Update walk error:', error);
    res.status(500).json({ error: 'Failed to update walk' });
  }
});

// Start walk (admin only)
walksRouter.post('/:id/start', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const walk = await prisma.walk.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date()
      },
      include: {
        attendances: {
          include: {
            dog: true
          }
        }
      }
    });

    res.json(walk);
  } catch (error) {
    console.error('Start walk error:', error);
    res.status(500).json({ error: 'Failed to start walk' });
  }
});

// End walk (admin only)
walksRouter.post('/:id/end', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const walk = await prisma.walk.findUnique({
      where: { id },
      include: { attendances: true }
    });

    if (!walk) {
      return res.status(404).json({ error: 'Walk not found' });
    }

    const endTime = new Date();
    const startTime = walk.startTime || endTime;
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Update walk and attendances
    await prisma.$transaction([
      prisma.walk.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          endTime
        }
      }),
      ...walk.attendances
        .filter(a => a.attended)
        .map(a =>
          prisma.attendance.update({
            where: { id: a.id },
            data: { duration: durationMinutes }
          })
        )
    ]);

    const updatedWalk = await prisma.walk.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            dog: true
          }
        }
      }
    });

    res.json(updatedWalk);
  } catch (error) {
    console.error('End walk error:', error);
    res.status(500).json({ error: 'Failed to end walk' });
  }
});

// Update attendance (admin only)
walksRouter.patch('/:walkId/attendance/:dogId', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { walkId, dogId } = req.params;
    const { attended } = req.body as UpdateAttendanceRequest;

    const attendance = await prisma.attendance.updateMany({
      where: {
        walkId,
        dogId
      },
      data: {
        attended
      }
    });

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Delete walk (admin only)
walksRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.walk.delete({
      where: { id }
    });

    res.json({ message: 'Walk deleted successfully' });
  } catch (error) {
    console.error('Delete walk error:', error);
    res.status(500).json({ error: 'Failed to delete walk' });
  }
});

