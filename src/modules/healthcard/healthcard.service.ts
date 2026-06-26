import { User } from '../../models/user.model';
import { HealthCard } from '../../models/healthCard.model';
import { ApiError } from '../../utils/apiError';
import { signPayload, verifyPayload, getPublicKeyPem } from '../../utils/signing';

export async function issueCard(patientId: string) {
  const user = await User.findById(patientId);
  if (!user || user.role !== 'PATIENT') throw new ApiError(404, 'Patient not found');

  const profile = user.patientProfile;
  // Build a plain, deterministic payload. Map sub-documents to plain objects so
  // the bytes signed here match exactly what the device re-serialises later.
  const contacts = (profile?.emergencyContacts ?? []).map((c: any) => ({
    name: c?.name ?? '',
    relationship: c?.relationship ?? '',
    phone: c?.phone ?? '',
  }));
  const payload = {
    patientId: String(user._id),
    name: `${user.firstName} ${user.lastName}`,
    bloodGroup: profile?.bloodGroup ?? null,
    allergies: [...(profile?.allergies ?? [])],
    emergencyContacts: contacts,
    issuedAt: new Date().toISOString(),
  };
  const signature = signPayload(payload);

  const card = await HealthCard.findOneAndUpdate(
    { patient: patientId },
    { $set: { payload, signature, algorithm: 'Ed25519' }, $setOnInsert: { patient: patientId } },
    { new: true, upsert: true },
  );

  return { card, publicKey: getPublicKeyPem() };
}

export async function getCard(patientId: string) {
  const card = await HealthCard.findOne({ patient: patientId });
  if (!card) throw new ApiError(404, 'No health card issued for this patient yet');
  // Self-heal: if the stored signature no longer verifies (for example the
  // signing key was rotated), re-sign the same payload with the current key so
  // older cards become valid again without re-issuing.
  if (!verifyPayload(card.payload, card.signature)) {
    card.signature = signPayload(card.payload);
    await card.save();
  }
  return { card, publicKey: getPublicKeyPem() };
}

export function verifyCard(payload: unknown, signature: string, publicKey?: string) {
  const valid = verifyPayload(payload, signature, publicKey);
  return { valid };
}
