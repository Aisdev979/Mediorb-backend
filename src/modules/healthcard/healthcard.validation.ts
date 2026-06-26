import { z } from 'zod';

export const verifyCardSchema = z.object({
  payload: z.record(z.any()),
  signature: z.string().min(1),
  publicKey: z.string().optional(),
});
