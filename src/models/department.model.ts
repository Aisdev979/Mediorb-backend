import { Schema, model } from 'mongoose';

const departmentSchema = new Schema(
  {
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

export const Department = model('Department', departmentSchema);
