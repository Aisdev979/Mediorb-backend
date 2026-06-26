import { MedicalRecord } from '../../models/medicalRecord.model';
import { HealthCard } from '../../models/healthCard.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { signPayload, verifyPayload, getPublicKeyPem } from '../../utils/healthcard';
import { CreateRecordInput } from './records.validation';

export async function createRecord(authorId: string, input: CreateRecordInput) {
  return MedicalRecord.create({
    patient: input.patientId,
    author: authorId,
    type: input.type,
    summary: input.summary,
    data: input.data,
  });
}

export async function listRecords(patientId: string) {
  return MedicalRecord.find({ patient: patientId })
    .populate('author', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .limit(200);
}

// Build a signed snapshot from the patient's profile. Re-issuing bumps the version.
export async function issueHealthCard(patientId: string) {
  const user = await User.findById(patientId);
  if (!user || user.role !== 'PATIENT') throw new ApiError(404, 'Patient not found');

  const profile = (user.patientProfile ?? {}) as any;
  const existing = await HealthCard.findOne({ patient: patientId });
  const version = existing ? (existing.version ?? 1) + 1 : 1;

  const payload = {
    patientId: String(user._id),
    name: `${user.firstName} ${user.lastName}`,
    bloodGroup: profile.bloodGroup ?? null,
    genotype: profile.genotype ?? null,
    allergies: profile.allergies ?? [],
    chronicConditions: profile.chronicConditions ?? [],
    emergencyContacts: profile.emergencyContacts ?? [],
    issuedAt: new Date().toISOString(),
    version,
  };

  const signature = signPayload(payload);

  const card = await HealthCard.findOneAndUpdate(
    { patient: patientId },
    { patient: patientId, payload, signature, algorithm: 'Ed25519', version, issuedAt: new Date() },
    { upsert: true, new: true },
  );

  return { card, publicKey: getPublicKeyPem() };
}

export async function getHealthCard(patientId: string) {
  const card = await HealthCard.findOne({ patient: patientId });
  if (!card) throw new ApiError(404, 'No health card issued for this patient');
  return { card, publicKey: getPublicKeyPem() };
}

export function getPublicKey() {
  return { algorithm: 'Ed25519', publicKey: getPublicKeyPem() };
}

// Offline-style verification: confirm the signature matches the payload.
export function verifyCard(payload: unknown, signature: string) {
  return { valid: verifyPayload(payload, signature), payload };
}
