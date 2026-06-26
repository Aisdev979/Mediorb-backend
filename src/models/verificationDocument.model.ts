import { Schema, model } from 'mongoose';

const verificationDocumentSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['NIN', 'VOTERS_CARD', 'MEDICAL_LICENSE', 'PMV_LICENSE', 'OTHER'],
      required: true,
    },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true },
);

export const VerificationDocument = model('VerificationDocument', verificationDocumentSchema);
