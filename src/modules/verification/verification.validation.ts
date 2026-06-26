import { z } from 'zod';

export const submitDocumentSchema = z.object({
  type: z.enum(['NIN', 'VOTERS_CARD', 'MEDICAL_LICENSE', 'PMV_LICENSE', 'OTHER']),
  fileUrl: z.string().url(),
});

export const reviewDocumentSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export type SubmitDocumentInput = z.infer<typeof submitDocumentSchema>;
