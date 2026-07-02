import { z } from 'zod';

export const createWalkerProfileSchema = z.object({
  userId: z.string().uuid('Gültige User-ID erforderlich'),
  bio: z.string().min(10, 'Bio mindestens 10 Zeichen').max(1000),
  experienceYears: z.number().int().min(0).max(50),
  hourlyRate: z.number().min(5).max(200),
  serviceAreas: z.array(z.string().min(1)).min(1, 'Mindestens ein Einsatzgebiet'),
  availability: z.array(z.string().min(1)).optional(),
  isAvailable: z.boolean().default(true),
  certifications: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateWalkerProfileSchema = createWalkerProfileSchema.partial().omit({ userId: true });

export const walkerSearchSchema = z.object({
  serviceArea: z.string().optional(),
  minRate: z.coerce.number().min(0).optional(),
  maxRate: z.coerce.number().max(200).optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  isAvailable: z.coerce.boolean().optional(),
  sortBy: z.enum(['hourlyRate', 'experienceYears', 'averageRating', 'totalWalks']).default('averageRating'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateWalkerInput = z.infer<typeof createWalkerProfileSchema>;
export type UpdateWalkerInput = z.infer<typeof updateWalkerProfileSchema>;
export type WalkerSearchInput = z.infer<typeof walkerSearchSchema>;
