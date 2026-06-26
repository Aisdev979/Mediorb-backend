import { Schema, model } from 'mongoose';

const reminderSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ['SMS', 'PUSH'], default: 'SMS' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'SENT', 'FAILED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    scheduledAt: { type: Date, required: true },
    sentAt: Date,
  },
  { timestamps: true },
);

export const Reminder = model('Reminder', reminderSchema);
