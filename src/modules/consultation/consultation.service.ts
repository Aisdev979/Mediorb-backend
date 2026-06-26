import { Consultation } from '../../models/consultation.model';
import { ApiError } from '../../utils/apiError';
import { Role } from '../../utils/jwt';
import { getIO } from '../../realtime/socket';
import { CreateConsultationInput, UpdateConsultationInput } from './consultation.validation';

export async function createConsultation(
  userId: string,
  role: Role,
  input: CreateConsultationInput,
) {
  const doctor = role === 'DOCTOR' ? userId : input.doctorId;
  if (!doctor) throw new ApiError(400, 'doctorId is required when a non-doctor creates a consultation');

  return Consultation.create({
    appointment: input.appointmentId,
    patient: input.patientId,
    doctor,
    facilitatedByPmv: role === 'PMV' ? userId : undefined,
    language: input.language ?? 'ENGLISH',
    chiefComplaint: input.chiefComplaint,
    status: 'SCHEDULED',
  });
}

export async function listForUser(userId: string, role: Role) {
  if (role === 'PATIENT') return Consultation.find({ patient: userId }).sort({ createdAt: -1 });
  if (role === 'DOCTOR') return Consultation.find({ doctor: userId }).sort({ createdAt: -1 });
  return Consultation.find().sort({ createdAt: -1 }).limit(200);
}

export async function getById(id: string) {
  const consultation = await Consultation.findById(id)
    .populate('patient', 'firstName lastName phone preferredLanguage patientProfile')
    .populate('doctor', 'firstName lastName doctorProfile');
  if (!consultation) throw new ApiError(404, 'Consultation not found');
  return consultation;
}

export async function updateConsultation(id: string, input: UpdateConsultationInput) {
  const consultation = await Consultation.findById(id);
  if (!consultation) throw new ApiError(404, 'Consultation not found');

  if (input.status) {
    consultation.status = input.status;
    if (input.status === 'ACTIVE') {
      if (!consultation.startedAt) consultation.startedAt = new Date();
      if (!consultation.videoRoomName) consultation.videoRoomName = `mediorb-${String(consultation._id)}`;
    }
    if (input.status === 'COMPLETED') consultation.endedAt = new Date();
  }
  if (input.notes !== undefined) consultation.notes = input.notes;
  if (input.chiefComplaint !== undefined) consultation.chiefComplaint = input.chiefComplaint;

  await consultation.save();
  return consultation;
}

export async function addMessage(id: string, senderId: string, body: string) {
  const consultation = await Consultation.findById(id);
  if (!consultation) throw new ApiError(404, 'Consultation not found');

  (consultation.messages as unknown as Array<Record<string, unknown>>).push({
    sender: senderId,
    body,
    sentAt: new Date(),
  });
  await consultation.save();

  const saved = consultation.messages[consultation.messages.length - 1];
  try {
    getIO().to(`consultation:${id}`).emit('consultation:message', saved);
  } catch {
    // socket not ready
  }
  return saved;
}
