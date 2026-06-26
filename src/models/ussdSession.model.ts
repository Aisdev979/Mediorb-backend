import { Schema, model } from 'mongoose';

const ussdSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    phone: { type: String, required: true, index: true },
    state: { type: String, default: 'START' },
    context: Schema.Types.Mixed,
  },
  { timestamps: true },
);

export const UssdSession = model('UssdSession', ussdSessionSchema);
