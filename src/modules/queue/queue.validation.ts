import { z } from 'zod';

export const joinQueueSchema = z.object({
  patientId: z.string().optional(), // honoured only when a PMV/ADMIN enqueues a walk-in
  appointmentId: z.string().optional(),
  hospitalId: z.string().optional(),
  departmentId: z.string().optional(),
});

export const updateQueueStatusSchema = z.object({
  status: z.enum(['WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED']),
});

export type JoinQueueInput = z.infer<typeof joinQueueSchema>;
