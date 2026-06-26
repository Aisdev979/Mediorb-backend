import { Schema, model } from 'mongoose';

const otpSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['PHONE_VERIFICATION', 'PASSWORD_RESET', 'LOGIN'],
      default: 'PHONE_VERIFICATION',
    },
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
  },
  { timestamps: true },
);

export const OtpCode = model('OtpCode', otpSchema);
