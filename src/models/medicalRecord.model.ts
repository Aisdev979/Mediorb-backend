import { Schema, model } from 'mongoose';

const medicalRecordSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    summary: String,
    data: Schema.Types.Mixed,
  },
  { timestamps: true },
);

export const MedicalRecord = model('MedicalRecord', medicalRecordSchema);
