import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.string().email('Gültige E-Mail erforderlich'),
});

export const validateInvitationSchema = z.object({
  token: z.string().min(1),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
