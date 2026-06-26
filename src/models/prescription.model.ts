import { Schema, model } from 'mongoose';

const itemSchema = new Schema(
  {
    drugName: { type: String, required: true },
    dosage: String,
    frequency: String,
    durationDays: Number,
    instructions: String,
    audioInstructionUrl: String, // Hear It In My Language
  },
  { _id: false },
);

const prescriptionSchema = new Schema(
  {
    consultation: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
    items: [itemSchema],
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Prescription = model('Prescription', prescriptionSchema);
