import { z } from 'zod';

const itemSchema = z.object({
  drugName: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  durationDays: z.number().int().positive().optional(),
  instructions: z.string().optional(),
  audioInstructionUrl: z.string().url().optional(), // Hear It In My Language
});

export const createPrescriptionSchema = z.object({
  patientId: z.string(),
  doctorId: z.string().optional(),
  consultationId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
