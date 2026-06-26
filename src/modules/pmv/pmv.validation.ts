import { z } from 'zod';

const emergencyContactSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().optional(),
  phone: z.string().min(7),
});

export const registerWalkInSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
});

export type RegisterWalkInInput = z.infer<typeof registerWalkInSchema>;
