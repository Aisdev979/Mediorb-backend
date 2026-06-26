import { z } from 'zod';

export const createRecordSchema = z.object({
  patientId: z.string(),
  type: z.string().min(1),
  summary: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export const verifyCardSchema = z.object({
  payload: z.record(z.any()),
  signature: z.string().min(1),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
