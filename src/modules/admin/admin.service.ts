import { User } from '../../models/user.model';
import { Appointment } from '../../models/appointment.model';
import { QueueEntry } from '../../models/queueEntry.model';
import { Consultation } from '../../models/consultation.model';
import { Prescription } from '../../models/prescription.model';
import { ApiError } from '../../utils/apiError';
import { hashPassword } from '../../utils/password';
import { publicUser } from '../auth/auth.service';
import { CreateUserInput } from './admin.validation';

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8);
}

export async function getStats() {
  const [patients, pmvs, doctors, admins] = await Promise.all([
    User.countDocuments({ role: 'PATIENT' }),
    User.countDocuments({ role: 'PMV' }),
    User.countDocuments({ role: 'DOCTOR' }),
    User.countDocuments({ role: 'ADMIN' }),
  ]);
  const [appointments, waiting, inConsultation, consultations, prescriptions] = await Promise.all([
    Appointment.countDocuments(),
    QueueEntry.countDocuments({ status: 'WAITING' }),
    QueueEntry.countDocuments({ status: 'IN_CONSULTATION' }),
    Consultation.countDocuments(),
    Prescription.countDocuments(),
  ]);
  return {
    users: { patients, pmvs, doctors, admins, total: patients + pmvs + doctors + admins },
    appointments,
    queue: { waiting, inConsultation },
    consultations,
    prescriptions,
  };
}

export async function listUsers(role?: string) {
  const query: Record<string, unknown> = {};
  if (role) query.role = role;
  return User.find(query).select('-passwordHash').sort({ createdAt: -1 }).limit(500);
}

export async function createUser(input: CreateUserInput) {
  const existing = await User.findOne({ phone: input.phone });
  if (existing) throw new ApiError(409, 'A user with this phone already exists.');

  const password = input.password ?? generateTempPassword();
  const passwordHash = await hashPassword(password);
  const generatedPassword = input.password ? undefined : password;

  const doc: Record<string, unknown> = {
    role: input.role,
    phone: input.phone,
    email: input.email.toLowerCase(),
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    preferredLanguage: input.preferredLanguage ?? 'ENGLISH',
    isPhoneVerified: true,
  };

  // An admin-created provider is already vouched for, so mark them APPROVED.
  if (input.role === 'DOCTOR') {
    doc.doctorProfile = {
      specialty: input.specialtyId,
      hospital: input.hospitalId,
      licenseNumber: input.licenseNumber,
      bio: input.bio,
      yearsExperience: input.yearsExperience,
      verificationStatus: 'APPROVED',
    };
  } else if (input.role === 'PMV') {
    doc.pmvProfile = {
      businessName: input.businessName,
      licenseNumber: input.licenseNumber,
      address: input.address,
      hospital: input.hospitalId,
      verificationStatus: 'APPROVED',
    };
  }

  const user = await User.create(doc);
  return { user: publicUser(user as never), temporaryPassword: generatedPassword };
}

export async function listAppointments() {
  return Appointment.find()
    .populate('patient', 'firstName lastName phone')
    .populate('doctor', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(500);
}

export async function setUserStatus(userId: string, isActive: boolean) {
  const user = await User.findByIdAndUpdate(userId, { $set: { isActive } }, { new: true }).select(
    '-passwordHash',
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}
