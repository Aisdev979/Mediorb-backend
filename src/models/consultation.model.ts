import { Schema, model } from 'mongoose';

export type ConsultationStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const consultationSchema = new Schema(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    facilitatedByPmv: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    language: {
      type: String,
      enum: ['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN'],
      default: 'ENGLISH',
    },
    chiefComplaint: String,
    notes: String,
    videoRoomName: String,
    recordingUrl: String,
    messages: [messageSchema],
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true },
);

export const Consultation = model('Consultation', consultationSchema);
