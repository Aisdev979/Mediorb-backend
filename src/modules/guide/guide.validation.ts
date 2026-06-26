import { z } from 'zod';

export const createGuideSchema = z.object({
  title: z.string().min(1),
  condition: z.enum(['DIABETES', 'HYPERTENSION', 'GENERAL', 'OTHER']).optional(),
  period: z.enum(['RAMADAN', 'LENT', 'OTHER']).optional(),
  language: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  body: z.string().min(1),
  audioUrl: z.string().url().optional(),
});

export type CreateGuideInput = z.infer<typeof createGuideSchema>;

export const updateGuideSchema = z.object({
  title: z.string().min(1).optional(),
  condition: z.enum(['DIABETES', 'HYPERTENSION', 'GENERAL', 'OTHER']).optional(),
  period: z.enum(['RAMADAN', 'LENT', 'OTHER']).optional(),
  language: z.enum(['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN']).optional(),
  body: z.string().min(1).optional(),
  audioUrl: z.string().url().optional(),
});
export type UpdateGuideInput = z.infer<typeof updateGuideSchema>;
