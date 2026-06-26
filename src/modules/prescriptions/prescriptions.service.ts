import { Prescription } from '../../models/prescription.model';
import { ApiError } from '../../utils/apiError';
import { Role } from '../../utils/jwt';
import { CreatePrescriptionInput } from './prescriptions.validation';

export async function createPrescription(
  userId: string,
  role: Role,
  input: CreatePrescriptionInput,
) {
  const doctor = role === 'DOCTOR' ? userId : input.doctorId;
  if (!doctor) throw new ApiError(400, 'doctorId is required when a non-doctor creates a prescription');

  return Prescription.create({
    consultation: input.consultationId,
    patient: input.patientId,
    doctor,
    notes: input.notes,
    items: input.items,
  });
}

export async function listPrescriptions(userId: string, role: Role, patientId?: string) {
  const query: Record<string, unknown> = {};
  if (role === 'PATIENT') query.patient = userId;
  else if (role === 'DOCTOR') query.doctor = userId;
  if (patientId && role !== 'PATIENT') query.patient = patientId;
  return Prescription.find(query).sort({ issuedAt: -1 }).limit(200);
}

export async function getById(id: string) {
  const prescription = await Prescription.findById(id)
    .populate('patient', 'firstName lastName phone preferredLanguage')
    .populate('doctor', 'firstName lastName');
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  return prescription;
}
