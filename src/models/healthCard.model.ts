import { Schema, model } from 'mongoose';

// Cryptographically signed snapshot for offline emergency access.
// payload holds bloodGroup, allergies, emergencyContacts; signature is produced
// server-side and verified offline via the public key. Signature, not a hash.
const healthCardSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    payload: { type: Schema.Types.Mixed, required: true },
    signature: { type: String, required: true },
    algorithm: { type: String, default: 'Ed25519' },
    version: { type: Number, default: 1 },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const HealthCard = model('HealthCard', healthCardSchema);
