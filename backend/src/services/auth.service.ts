import { prisma } from '../lib/prisma.js';
import * as argon2 from 'argon2';
import { generateToken } from '../lib/jwt.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.js';

export class AuthService {
  async register(input: RegisterInput) {
    const invitation = await prisma.invitation.findUnique({
      where: { token: input.token }
    });

    if (!invitation) throw new ValidationError('Invalid invitation token');
    if (invitation.usedAt) throw new ValidationError('Invitation token already used');
    if (new Date() > invitation.expiresAt) throw new ValidationError('Invitation token expired');
    if (invitation.email !== input.email) throw new ValidationError('Email does not match invitation');

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) throw new ValidationError('User already exists');

    const hashedPassword = await argon2.hash(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: 'OWNER'
      }
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() }
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        createdAt: user.createdAt,
      },
      token
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AuthError('Invalid credentials');

    const validPassword = await argon2.verify(user.password, input.password);
    if (!validPassword) throw new AuthError('Invalid credentials');

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        createdAt: user.createdAt,
      },
      token
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        createdAt: user.createdAt,
      }
    };
  }
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const authService = new AuthService();
