import { prisma } from '../lib/prisma.js';
import { ForbiddenError, NotFoundError } from './auth.service.js';
import type { CreateWalkerInput, UpdateWalkerInput, WalkerSearchInput } from '../schemas/walker.js';

const walkInclude = {
  user: {
    select: { id: true, email: true, firstName: true, lastName: true, phone: true }
  }
};

export class WalkerService {
  async list() {
    return prisma.walkerProfile.findMany({
      include: walkInclude,
      orderBy: { averageRating: 'desc' }
    });
  }

  async getById(id: string) {
    const profile = await prisma.walkerProfile.findUnique({
      where: { id },
      include: walkInclude
    });
    if (!profile) throw new NotFoundError('Walker profile not found');
    return profile;
  }

  async search(filters: WalkerSearchInput) {
    const where: any = { isAvailable: true };

    if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
    if (filters.minRate) where.hourlyRate = { ...where.hourlyRate, gte: filters.minRate };
    if (filters.maxRate) where.hourlyRate = { ...where.hourlyRate, lte: filters.maxRate };
    if (filters.minExperience) where.experienceYears = { gte: filters.minExperience };
    if (filters.minRating) where.averageRating = { gte: filters.minRating };
    if (filters.serviceArea) {
      where.serviceAreas = { contains: filters.serviceArea };
    }

    const orderField = filters.sortBy || 'averageRating';
    const orderDir = filters.order || 'desc';
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 50);
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      prisma.walkerProfile.findMany({
        where,
        include: walkInclude,
        orderBy: { [orderField]: orderDir },
        skip,
        take: limit,
      }),
      prisma.walkerProfile.count({ where }),
    ]);

    return {
      data: profiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(input: CreateWalkerInput) {
    const existing = await prisma.walkerProfile.findUnique({ where: { userId: input.userId } });
    if (existing) throw new ForbiddenError('Walker profile already exists for this user');

    return prisma.walkerProfile.create({
      data: {
        ...input,
        serviceAreas: JSON.stringify(input.serviceAreas),
        availability: input.availability ? JSON.stringify(input.availability) : null,
        certifications: input.certifications ? JSON.stringify(input.certifications) : null,
      },
      include: walkInclude
    });
  }

  async update(id: string, input: UpdateWalkerInput) {
    const existing = await prisma.walkerProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Walker profile not found');

    const data: any = { ...input };
    if (input.serviceAreas) data.serviceAreas = JSON.stringify(input.serviceAreas);
    if (input.availability) data.availability = JSON.stringify(input.availability);
    if (input.certifications) data.certifications = JSON.stringify(input.certifications);

    return prisma.walkerProfile.update({
      where: { id },
      data,
      include: walkInclude
    });
  }

  async delete(id: string) {
    const existing = await prisma.walkerProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Walker profile not found');

    await prisma.walkerProfile.delete({ where: { id } });
  }
}

export const walkerService = new WalkerService();
