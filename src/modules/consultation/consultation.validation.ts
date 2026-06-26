import { z } from 'zod';

export const createConsultationSchema = z.object({
  patientId: z.string(),
  doctorId: z.string().optional(), // required only when a non-doctor creates it
  appointmentId: z.string().optional(),
  language: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  chiefComplaint: z.string().optional(),
});

export const updateConsultationSchema = z.object({
  status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  chiefComplaint: z.string().optional(),
});

export const consultationMessageSchema = z.object({
  body: z.string().min(1),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
