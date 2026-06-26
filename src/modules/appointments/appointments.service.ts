import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import { ApiError } from '../../utils/apiError';
import { Role } from '../../utils/jwt';
import { CreateAppointmentInput } from './appointments.validation';
import { createNotification } from '../notifications/notifications.service';

export async function createAppointment(
  userId: string,
  role: Role,
  input: CreateAppointmentInput,
) {
  const patient = role === 'PMV' && input.patientId ? input.patientId : userId;
  return Appointment.create({
    patient,
    doctor: input.doctorId,
    createdByPmv: role === 'PMV' ? userId : undefined,
    hospital: input.hospitalId,
    department: input.departmentId,
    specialty: input.specialtyId,
    channel: role === 'PMV' ? 'PMV' : (input.channel ?? 'APP'),
    preferredLanguage: input.preferredLanguage ?? 'ENGLISH',
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    reason: input.reason,
  });
}

export async function listForUser(userId: string, role: Role) {
  if (role === 'PATIENT')
    return Appointment.find({ patient: userId })
      .populate('doctor', 'firstName lastName')
      .populate('specialty', 'name')
      .populate('hospital', 'name')
      .sort({ createdAt: -1 });
  if (role === 'DOCTOR')
    return Appointment.find({ doctor: userId })
      .populate('patient', 'firstName lastName phone')
      .populate('specialty', 'name')
      .populate('hospital', 'name')
      .sort({ createdAt: -1 });
  return Appointment.find()
    .populate('patient', 'firstName lastName phone')
    .populate('doctor', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(200); // ADMIN / PMV
}

export async function getById(id: string) {
  const appt = await Appointment.findById(id)
    .populate('patient', 'firstName lastName phone')
    .populate('doctor', 'firstName lastName')
    .populate('specialty', 'name')
    .populate('department', 'name');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  return appt;
}

export async function updateStatus(id: string, status: AppointmentStatus) {
  const appt = await Appointment.findById(id);
  if (!appt) throw new ApiError(404, 'Appointment not found');
  appt.status = status;
  await appt.save();

  // Let the patient know their appointment moved.
  const labels: Record<string, string> = {
    CONFIRMED: 'Your appointment has been confirmed.',
    CANCELLED: 'Your appointment was cancelled.',
    COMPLETED: 'Your appointment is marked complete.',
    PENDING: 'Your appointment is pending confirmation.',
  };
  try {
    await createNotification(
      String(appt.patient),
      'APPOINTMENT',
      'Appointment update',
      labels[status] ?? `Appointment status: ${status}`,
    );
  } catch {
    // Notifications are best-effort; never block the status change.
  }
  return appt;
}
