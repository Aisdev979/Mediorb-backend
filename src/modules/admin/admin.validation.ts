import { z } from 'zod';

// Admin creates a staff or patient account directly. Unlike public registration,
// this skips the OTP step: the admin is vouching for the account, so it is created
// already verified. A password is optional; if omitted, a temporary one is generated
// and returned so the admin can hand it to the new user.
export const createUserSchema = z.object({
  role: z.enum(['PATIENT', 'PMV', 'DOCTOR', 'ADMIN']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  preferredLanguage: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  // Optional profile fields, used when the role is DOCTOR or PMV.
  licenseNumber: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  specialtyId: z.string().optional(),
  hospitalId: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.number().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
