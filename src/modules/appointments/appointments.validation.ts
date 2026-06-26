import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().optional(), // only honoured when a PMV books for a walk-in
  doctorId: z.string().optional(),
  hospitalId: z.string().optional(),
  departmentId: z.string().optional(),
  specialtyId: z.string().optional(),
  channel: z.enum(['APP', 'USSD', 'PMV']).optional(),
  preferredLanguage: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  scheduledAt: z.string().optional(),
  reason: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
