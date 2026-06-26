import { z } from 'zod';

export const updateMeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  avatarUrl: z.string().url().optional(),
  notificationPrefs: z
    .object({
      appointments: z.boolean().optional(),
      queue: z.boolean().optional(),
      prescriptions: z.boolean().optional(),
      general: z.boolean().optional(),
    })
    .optional(),
});

// Role-specific profile payload. Kept permissive; the model enforces shape.
export const updateProfileSchema = z.record(z.any());

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
