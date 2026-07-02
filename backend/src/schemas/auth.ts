import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Gültige E-Mail erforderlich'),
  password: z.string().min(6, 'Passwort mindestens 6 Zeichen'),
});

export const registerSchema = z.object({
  email: z.string().email('Gültige E-Mail erforderlich'),
  password: z.string().min(6, 'Passwort mindestens 6 Zeichen'),
  firstName: z.string().min(1, 'Vorname erforderlich'),
  lastName: z.string().min(1, 'Nachname erforderlich'),
  phone: z.string().optional(),
  token: z.string().min(1, 'Einladungstoken erforderlich'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
