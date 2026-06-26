import { Schema, model } from 'mongoose';

const supportTicketSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
  },
  { timestamps: true },
);

export const SupportTicket = model('SupportTicket', supportTicketSchema);
