import { Router } from 'express';
import { userService } from '../services/user.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/', requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const users = await userService.list();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

usersRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const user = await userService.getById(req.user!.userId, req.user!.role, req.params.id);
    res.json(user);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to fetch user' });
  }
});

usersRouter.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const user = await userService.update(
      req.user!.userId,
      req.user!.role,
      req.params.id,
      req.body
    );
    res.json(user);
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to update user' });
  }
});

usersRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await userService.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to delete user' });
  }
});
