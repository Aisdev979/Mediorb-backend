import { SupportTicket } from '../../models/supportTicket.model';
import { ApiError } from '../../utils/apiError';
import { CreateTicketInput } from './support.validation';

export async function createTicket(userId: string, input: CreateTicketInput) {
  return SupportTicket.create({ user: userId, subject: input.subject, body: input.body });
}

export async function listOwn(userId: string) {
  return SupportTicket.find({ user: userId }).sort({ createdAt: -1 });
}

export async function listAll(status?: string) {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  return SupportTicket.find(query)
    .populate('user', 'firstName lastName role phone')
    .sort({ createdAt: -1 })
    .limit(500);
}

export async function updateStatus(id: string, status: string) {
  const ticket = await SupportTicket.findById(id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  ticket.status = status as never;
  await ticket.save();
  return ticket;
}
