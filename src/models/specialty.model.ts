import { Schema, model } from 'mongoose';

const specialtySchema = new Schema(
  { name: { type: String, required: true, unique: true }, description: String },
  { timestamps: true },
);

export const Specialty = model('Specialty', specialtySchema);
