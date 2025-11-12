import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../lib/jwt.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@dogwalking/shared';

export const authRouter = Router();

// Register (with invitation token)
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, token } = req.body as RegisterRequest;

    // Validate invitation token
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return res.status(400).json({ error: 'Invalid invitation token' });
    }

    if (invitation.usedAt) {
      return res.status(400).json({ error: 'Invitation token already used' });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation token expired' });
    }

    if (invitation.email !== email) {
      return res.status(400).json({ error: 'Email does not match invitation' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'OWNER'
      }
    });

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() }
    });

    // Generate JWT
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as any,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        createdAt: user.createdAt
      },
      token: jwtToken
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as any,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        createdAt: user.createdAt
      },
      token
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
authRouter.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as any,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        createdAt: user.createdAt
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

