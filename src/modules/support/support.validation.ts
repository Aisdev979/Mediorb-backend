import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
