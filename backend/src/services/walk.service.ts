import { prisma } from '../lib/prisma.js';
import { NotFoundError, ValidationError } from './auth.service.js';
import type { CreateWalkInput, UpdateWalkInput, WalkFilter } from '../schemas/walk.js';

const walkInclude = {
  admin: { select: { id: true, email: true, firstName: true, lastName: true } },
  attendances: {
    include: {
      dog: {
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } }
        }
      }
    }
  }
};

export class WalkService {
  async list(userId: string, role: string, filter?: WalkFilter) {
    const where: any = {};

    if (filter?.startDate && filter?.endDate) {
      where.date = { gte: filter.startDate, lte: filter.endDate };
    }
    if (filter?.status) {
      where.status = filter.status;
    }

    if (role === 'OWNER') {
      const userDogs = await prisma.dog.findMany({
        where: { ownerId: userId },
        select: { id: true }
      });
      const dogIds = userDogs.map(d => d.id);
      where.attendances = { some: { dogId: { in: dogIds } } };
    } else if (filter?.dogId) {
      where.attendances = { some: { dogId: filter.dogId } };
    }

    return prisma.walk.findMany({
      where,
      include: walkInclude,
      orderBy: { date: 'desc' }
    });
  }

  async getById(userId: string, role: string, id: string) {
    const walk = await prisma.walk.findUnique({
      where: { id },
      include: walkInclude
    });

    if (!walk) throw new NotFoundError('Walk not found');

    if (role === 'OWNER') {
      const userDogIds = (await prisma.dog.findMany({
        where: { ownerId: userId },
        select: { id: true }
      })).map(d => d.id);

      const hasUserDog = walk.attendances.some(a => userDogIds.includes(a.dogId));
      if (!hasUserDog) throw new NotFoundError('Access denied');
    }

    return walk;
  }

  async create(adminId: string, input: CreateWalkInput) {
    return prisma.walk.create({
      data: {
        date: input.date,
        status: 'SCHEDULED',
        adminId,
        notes: input.notes,
        attendances: {
          create: input.dogIds.map(dogId => ({ dogId, attended: false })),
        },
      },
      include: walkInclude,
    });
  }

  async update(id: string, input: UpdateWalkInput) {
    if (input.dogIds) {
      await prisma.attendance.deleteMany({ where: { walkId: id } });
      await prisma.attendance.createMany({
        data: input.dogIds.map(dogId => ({ walkId: id, dogId, attended: false })),
      });
    }

    return prisma.walk.update({
      where: { id },
      data: {
        ...(input.date && { date: input.date }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.status && { status: input.status }),
      },
      include: walkInclude,
    });
  }

  async start(id: string) {
    const walk = await prisma.walk.findUnique({ where: { id } });
    if (!walk) throw new NotFoundError('Walk not found');
    if (walk.status !== 'SCHEDULED') throw new ValidationError('Walk must be SCHEDULED to start');

    return prisma.walk.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startTime: new Date() },
      include: walkInclude,
    });
  }

  async end(id: string) {
    const walk = await prisma.walk.findUnique({
      where: { id },
      include: { attendances: true }
    });
    if (!walk) throw new NotFoundError('Walk not found');
    if (walk.status !== 'IN_PROGRESS') throw new ValidationError('Walk must be IN_PROGRESS to end');

    const endTime = new Date();
    const startTime = walk.startTime || endTime;
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    await prisma.$transaction([
      prisma.walk.update({
        where: { id },
        data: { status: 'COMPLETED', endTime }
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

    return prisma.walk.findUnique({
      where: { id },
      include: walkInclude,
    });
  }

  async toggleAttendance(walkId: string, dogId: string, attended: boolean) {
    await prisma.attendance.updateMany({
      where: { walkId, dogId },
      data: { attended }
    });
  }

  async confirm(id: string) {
    const walk = await prisma.walk.findUnique({ where: { id } });
    if (!walk) throw new NotFoundError('Walk not found');
    if (walk.status !== 'SCHEDULED') throw new ValidationError('Only SCHEDULED walks can be confirmed');

    return prisma.walk.update({
      where: { id },
      data: { status: 'SCHEDULED' },
      include: walkInclude,
    });
  }

  async cancel(id: string) {
    const walk = await prisma.walk.findUnique({ where: { id } });
    if (!walk) throw new NotFoundError('Walk not found');
    if (walk.status === 'COMPLETED') throw new ValidationError('Cannot cancel a completed walk');

    return prisma.walk.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: walkInclude,
    });
  }

  async remove(id: string) {
    await prisma.walk.delete({ where: { id } });
  }

  async getStats() {
    const [scheduled, inProgress, completed, cancelled, total] = await Promise.all([
      prisma.walk.count({ where: { status: 'SCHEDULED' } }),
      prisma.walk.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.walk.count({ where: { status: 'COMPLETED' } }),
      prisma.walk.count({ where: { status: 'CANCELLED' } }),
      prisma.walk.count(),
    ]);
    return { scheduled, inProgress, completed, cancelled, total };
  }
}

export const walkService = new WalkService();
