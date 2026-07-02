import { prisma } from '../lib/prisma.js';
import { NotFoundError } from './auth.service.js';

export class UserService {
  async list() {
    return prisma.user.findMany({
      select: {
        id: true, email: true, role: true, firstName: true,
        lastName: true, phone: true, createdAt: true,
        _count: { select: { dogs: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(requestingUserId: string, role: string, id: string) {
    if (role !== 'ADMIN' && requestingUserId !== id) {
      throw new NotFoundError('Access denied');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true, firstName: true,
        lastName: true, phone: true, createdAt: true,
        dogs: true
      }
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async update(requestingUserId: string, role: string, id: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    if (role !== 'ADMIN' && requestingUserId !== id) {
      throw new NotFoundError('Access denied');
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, role: true, firstName: true,
        lastName: true, phone: true, createdAt: true,
      }
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async getOwners() {
    return prisma.user.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, createdAt: true,
        _count: { select: { dogs: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAdmins() {
    return prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
  }
}

export const userService = new UserService();
