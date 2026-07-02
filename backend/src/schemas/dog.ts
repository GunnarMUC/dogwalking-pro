import { z } from 'zod';

export const createDogSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  breed: z.string().optional(),
  age: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  ownerId: z.string().uuid('Gültige Owner-ID erforderlich'),
  medicalNotes: z.string().optional(),
  emergencyContact: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const updateDogSchema = createDogSchema.partial();

export type CreateDogInput = z.infer<typeof createDogSchema>;
export type UpdateDogInput = z.infer<typeof updateDogSchema>;
