import { Router } from 'express';
import { dogService } from '../services/dog.service.js';
import { userService } from '../services/user.service.js';
import { walkService } from '../services/walk.service.js';
import { walkerService } from '../services/walker.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/stats', async (_req: AuthRequest, res) => {
  try {
    const walkers = await walkerService.list();
    const walkStats = await walkService.getStats();

    res.json({
      totalWalkers: walkers.length,
      scheduledWalks: walkStats.scheduled,
      inProgressWalks: walkStats.inProgress,
      completedWalks: walkStats.completed,
      cancelledWalks: walkStats.cancelled,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});
