import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { hashPassword } from '../../utils/password';
import { publicUser } from '../auth/auth.service';
import { RegisterWalkInInput } from './pmv.validation';

function tempPassword(): string {
  return Math.random().toString(36).slice(-8);
}

// A PMV registers a walk-in patient at the chemist. The PMV vouches for them,
// so the phone is marked verified. A temporary password is returned so the
// patient can log in on their own device later.
export async function registerWalkIn(input: RegisterWalkInInput) {
  const existing = await User.findOne({ phone: input.phone });
  if (existing) {
    throw new ApiError(409, 'A user with this phone already exists. Use patient lookup instead.');
  }

  const password = tempPassword();
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    role: 'PATIENT',
    phone: input.phone,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
    preferredLanguage: input.preferredLanguage ?? 'ENGLISH',
    isPhoneVerified: true,
    patientProfile: {
      bloodGroup: input.bloodGroup,
      allergies: input.allergies ?? [],
      emergencyContacts: input.emergencyContacts ?? [],
    },
  });

  return { patient: publicUser(user), temporaryPassword: password };
}

export async function lookupPatients(search?: string) {
  const query: Record<string, unknown> = { role: 'PATIENT' };
  if (search) {
    const rx = { $regex: search, $options: 'i' };
    query.$or = [{ phone: rx }, { firstName: rx }, { lastName: rx }];
  }
  return User.find(query).select('-passwordHash').sort({ createdAt: -1 }).limit(20);
}

// Everything this PMV has touched: appointments they booked and consultations
// they facilitated, newest first, with patient and doctor names populated.
export async function getActivity(pmvId: string) {
  const { Appointment } = await import('../../models/appointment.model');
  const { Consultation } = await import('../../models/consultation.model');
  const [appointments, consultations] = await Promise.all([
    Appointment.find({ createdByPmv: pmvId })
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName')
      .populate('specialty', 'name')
      .sort({ createdAt: -1 })
      .limit(100),
    Consultation.find({ facilitatedByPmv: pmvId })
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100),
  ]);
  return { appointments, consultations };
}
