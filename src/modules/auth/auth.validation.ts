import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['PATIENT', 'PMV', 'DOCTOR', 'ADMIN']),
  phone: z.string().min(7),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(7),
  code: z.string().length(6),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
