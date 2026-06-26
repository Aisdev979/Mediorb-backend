import { Schema, model } from 'mongoose';

export type AppointmentChannel = 'APP' | 'USSD' | 'PMV';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const appointmentSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByPmv: { type: Schema.Types.ObjectId, ref: 'User' },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    specialty: { type: Schema.Types.ObjectId, ref: 'Specialty' },
    channel: { type: String, enum: ['APP', 'USSD', 'PMV'], default: 'APP' },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN'],
      default: 'ENGLISH',
    },
    scheduledAt: Date,
    reason: String,
  },
  { timestamps: true },
);

export const Appointment = model('Appointment', appointmentSchema);
