import { z } from 'zod';

export const createWalkSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format JJJJ-MM-TT'),
  dogIds: z.array(z.string().uuid()).min(1, 'Mindestens ein Hund auswählen'),
  notes: z.string().optional(),
});

export const updateWalkSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dogIds: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const walkFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dogId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const attendanceToggleSchema = z.object({
  attended: z.boolean(),
});

export type CreateWalkInput = z.infer<typeof createWalkSchema>;
export type UpdateWalkInput = z.infer<typeof updateWalkSchema>;
export type WalkFilter = z.infer<typeof walkFilterSchema>;
