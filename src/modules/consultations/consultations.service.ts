import { Consultation, ConsultationStatus } from '../../models/consultation.model';
import { ApiError } from '../../utils/apiError';
import { Role } from '../../utils/jwt';
import { getIO } from '../../realtime/socket';
import { CreateConsultationInput, UpdateConsultationInput } from './consultations.validation';

export async function createConsultation(
  userId: string,
  role: Role,
  input: CreateConsultationInput,
) {
  const doctorId = role === 'DOCTOR' ? userId : input.doctorId;
  if (!doctorId) throw new ApiError(400, 'doctorId is required when not created by a doctor');
  const videoRoomName = `mediorb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return Consultation.create({
    patient: input.patientId,
    doctor: doctorId,
    facilitatedByPmv: role === 'PMV' ? userId : undefined,
    appointment: input.appointmentId,
    chiefComplaint: input.chiefComplaint,
    language: input.language ?? 'ENGLISH',
    status: 'SCHEDULED',
    videoRoomName,
  });
}

export async function listForUser(userId: string, role: Role) {
  if (role === 'PATIENT') return Consultation.find({ patient: userId }).sort({ createdAt: -1 });
  if (role === 'DOCTOR') return Consultation.find({ doctor: userId }).sort({ createdAt: -1 });
  return Consultation.find().sort({ createdAt: -1 }).limit(200);
}

export async function getById(id: string) {
  const c = await Consultation.findById(id)
    .populate('patient', 'firstName lastName phone preferredLanguage')
    .populate('doctor', 'firstName lastName');
  if (!c) throw new ApiError(404, 'Consultation not found');
  return c;
}

export async function update(id: string, input: UpdateConsultationInput) {
  const c = await Consultation.findById(id);
  if (!c) throw new ApiError(404, 'Consultation not found');
  if (input.status) {
    c.status = input.status as ConsultationStatus;
    if (input.status === 'ACTIVE' && !c.startedAt) c.startedAt = new Date();
    if (input.status === 'COMPLETED' && !c.endedAt) c.endedAt = new Date();
  }
  if (input.notes !== undefined) c.notes = input.notes;
  if (input.recordingUrl !== undefined) c.recordingUrl = input.recordingUrl;
  await c.save();
  return c;
}

export async function addMessage(id: string, senderId: string, body: string) {
  const message = { sender: senderId, body, sentAt: new Date() };
  const c = await Consultation.findByIdAndUpdate(
    id,
    { $push: { messages: message } },
    { new: true },
  );
  if (!c) throw new ApiError(404, 'Consultation not found');
  try {
    getIO().to(`consultation:${id}`).emit('consultation:message', { consultationId: id, ...message });
  } catch {
    // socket not ready
  }
  return message;
}
