import { Schema, model } from 'mongoose';

export type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';

const queueEntrySchema = new Schema(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    queueNumber: { type: String, required: true },
    position: { type: Number, required: true },
    status: {
      type: String,
      enum: ['WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING',
      index: true,
    },
    estimatedWaitMinutes: Number,
  },
  { timestamps: true },
);

export const QueueEntry = model('QueueEntry', queueEntrySchema);
