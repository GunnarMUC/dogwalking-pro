import { Router } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import type { CreateInvitationRequest } from '@dogwalking/shared';

export const invitationsRouter = Router();

// All routes require authentication and admin role
invitationsRouter.use(authenticate, requireAdmin);

// Get all invitations
invitationsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const invitations = await prisma.invitation.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Create invitation
invitationsRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { email } = req.body as CreateInvitationRequest;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check for existing unused invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'Active invitation already exists for this email' });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        createdById: req.user!.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Delete invitation
invitationsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.invitation.delete({
      where: { id }
    });

    res.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Delete invitation error:', error);
    res.status(500).json({ error: 'Failed to delete invitation' });
  }
});

// Validate invitation token (public endpoint - no auth required)
invitationsRouter.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid invitation token', valid: false });
    }

    if (invitation.usedAt) {
      return res.status(400).json({ error: 'Invitation already used', valid: false });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation expired', valid: false });
    }

    res.json({ valid: true, email: invitation.email });
  } catch (error) {
    console.error('Validate invitation error:', error);
    res.status(500).json({ error: 'Failed to validate invitation' });
  }
});

