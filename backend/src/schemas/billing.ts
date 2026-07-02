import { z } from 'zod';

export const billingReportSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format JJJJ-MM-TT'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format JJJJ-MM-TT'),
  dogId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
});

export const createRateSchema = z.object({
  dogId: z.string().uuid(),
  hourlyRate: z.number().min(0, 'Stundensatz muss positiv sein'),
  effectiveFrom: z.coerce.date(),
});

export type BillingReportInput = z.infer<typeof billingReportSchema>;
export type CreateRateInput = z.infer<typeof createRateSchema>;
