import { z } from 'zod';

export const createReminderSchema = z.object({
  patientId: z.string(),
  message: z.string().min(1),
  channel: z.enum(['SMS', 'PUSH']).optional(),
  scheduledAt: z.string(),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
