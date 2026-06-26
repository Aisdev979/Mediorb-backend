import { Schema, model } from 'mongoose';

const fastingGuideSchema = new Schema(
  {
    title: { type: String, required: true },
    condition: {
      type: String,
      enum: ['DIABETES', 'HYPERTENSION', 'GENERAL', 'OTHER'],
      default: 'GENERAL',
    },
    period: { type: String, enum: ['RAMADAN', 'LENT', 'OTHER'], default: 'OTHER' },
    language: {
      type: String,
      enum: ['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN'],
      default: 'ENGLISH',
    },
    body: { type: String, required: true },
    audioUrl: String,
  },
  { timestamps: true },
);

export const FastingGuide = model('FastingGuide', fastingGuideSchema);
