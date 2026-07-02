import { prisma } from '../lib/prisma.js';
import { ForbiddenError, NotFoundError } from './auth.service.js';
import type { CreateDogInput, UpdateDogInput } from '../schemas/dog.js';
import type { DogFilter } from '@dogwalking/shared';

export class DogService {
  async list(userId: string, role: string, filter?: DogFilter) {
    const where: any = {};

    if (role === 'OWNER') {
      where.ownerId = userId;
    } else if (filter?.ownerId) {
      where.ownerId = filter.ownerId;
    }

    if (filter?.searchText) {
      where.OR = [
        { name: { contains: filter.searchText } },
        { breed: { contains: filter.searchText } },
      ];
    }

    return prisma.dog.findMany({
      where,
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        rates: { orderBy: { effectiveFrom: 'desc' }, take: 1 }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getById(userId: string, role: string, id: string) {
    const dog = await prisma.dog.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        rates: { orderBy: { effectiveFrom: 'desc' } }
      }
    });

    if (!dog) throw new NotFoundError('Dog not found');
    if (role === 'OWNER' && dog.ownerId !== userId) throw new ForbiddenError('Access denied');

    return dog;
  }

  async create(data: CreateDogInput) {
    return prisma.dog.create({
      data,
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } }
      }
    });
  }

  async update(id: string, data: UpdateDogInput) {
    const dog = await prisma.dog.findUnique({ where: { id } });
    if (!dog) throw new NotFoundError('Dog not found');

    return prisma.dog.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } }
      }
    });
  }

  async delete(id: string) {
    const dog = await prisma.dog.findUnique({ where: { id } });
    if (!dog) throw new NotFoundError('Dog not found');

    await prisma.dog.delete({ where: { id } });
  }

  async getStats() {
    const [total, breeds] = await Promise.all([
      prisma.dog.count(),
      prisma.dog.groupBy({ by: ['breed'], _count: true }),
    ]);
    return { total, breedDistribution: breeds };
  }
}

export const dogService = new DogService();
