import { prisma } from '../lib/prisma.js';
import { NotFoundError } from './auth.service.js';
import type { CreateRateInput } from '../schemas/billing.js';

export class RateService {
  async list(dogId?: string) {
    const where: any = {};
    if (dogId) where.dogId = dogId;

    return prisma.rate.findMany({
      where,
      include: {
        dog: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { effectiveFrom: 'desc' }
    });
  }

  async create(input: CreateRateInput) {
    return prisma.rate.create({
      data: {
        dogId: input.dogId,
        hourlyRate: input.hourlyRate,
        effectiveFrom: input.effectiveFrom,
      },
      include: {
        dog: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  async update(id: string, data: { hourlyRate?: number; effectiveFrom?: Date }) {
    return prisma.rate.update({
      where: { id },
      data,
      include: {
        dog: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  async delete(id: string) {
    await prisma.rate.delete({ where: { id } });
  }
}

export const rateService = new RateService();
