import { z } from 'zod';

export const idSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['asc', 'desc']).default('desc'),
  order: z.string().default('createdAt'),
});

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format JJJJ-MM-TT erwartet');

export const emailSchema = z.string().email('Gültige E-Mail erforderlich');
