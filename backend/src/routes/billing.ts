import { Router } from 'express';
import { ZodError } from 'zod';
import { billingService } from '../services/billing.service.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { billingReportSchema } from '../schemas/billing.js';

export const billingRouter = Router();
billingRouter.use(authenticate, requireAdmin);

billingRouter.post('/report', async (req: AuthRequest, res) => {
  try {
    const data = billingReportSchema.parse(req.body);
    const report = await billingService.generateReport(data);
    res.json(report);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    console.error('Billing report error:', error);
    const status = (error as any).status || 500;
    res.status(status).json({ error: (error as Error).message || 'Failed to generate report' });
  }
});

billingRouter.post('/export/csv', async (req: AuthRequest, res) => {
  try {
    const data = billingReportSchema.parse(req.body);
    const csv = await billingService.exportCSV(data);

    const filename = `abrechnung-${data.startDate}-${data.endDate}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});
