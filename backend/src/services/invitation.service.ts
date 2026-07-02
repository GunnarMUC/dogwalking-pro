import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { ValidationError, NotFoundError } from './auth.service.js';
import type { CreateInvitationInput } from '../schemas/invitation.js';

export class InvitationService {
  async list() {
    return prisma.invitation.findMany({
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(adminId: string, input: CreateInvitationInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) throw new ValidationError('User with this email already exists');

    const existingInvitation = await prisma.invitation.findFirst({
      where: { email: input.email, usedAt: null, expiresAt: { gt: new Date() } }
    });
    if (existingInvitation) throw new ValidationError('Active invitation already exists for this email');

    const token = randomBytes(32).toString('hex');

    return prisma.invitation.create({
      data: {
        email: input.email,
        token,
        createdById: adminId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } }
      }
    });
  }

  async delete(id: string) {
    await prisma.invitation.delete({ where: { id } });
  }

  async validate(token: string) {
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) return { valid: false, error: 'Invalid invitation token' };
    if (invitation.usedAt) return { valid: false, error: 'Invitation already used' };
    if (new Date() > invitation.expiresAt) return { valid: false, error: 'Invitation expired' };
    return { valid: true, email: invitation.email };
  }
}

export const invitationService = new InvitationService();
