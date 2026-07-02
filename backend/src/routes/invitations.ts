import { Router } from 'express';
import { ZodError } from 'zod';
import { invitationService } from '../services/invitation.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createInvitationSchema } from '../schemas/invitation.js';

export const invitationsRouter = Router();
invitationsRouter.use(authenticate, requireAdmin);

invitationsRouter.get('/', async (_req: AuthRequest, res) => {
  try {
    const invitations = await invitationService.list();
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

invitationsRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const data = createInvitationSchema.parse(req.body);
    const invitation = await invitationService.create(req.user!.userId, data);
    res.status(201).json(invitation);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to create invitation' });
  }
});

invitationsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await invitationService.delete(req.params.id);
    res.json({ message: 'Invitation deleted' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to delete invitation' });
  }
});

invitationsRouter.get('/validate/:token', async (req, res) => {
  try {
    const result = await invitationService.validate(req.params.token);
    if (!result.valid) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate invitation' });
  }
});
