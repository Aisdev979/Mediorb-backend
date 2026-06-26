import { Schema, model } from 'mongoose';

const hospitalSchema = new Schema(
  { name: { type: String, required: true }, address: String, phone: String },
  { timestamps: true },
);

export const Hospital = model('Hospital', hospitalSchema);
