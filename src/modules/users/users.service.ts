import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { Role } from '../../utils/jwt';
import { UpdateMeInput } from './users.validation';

export async function getMe(id: string) {
  const user = await User.findById(id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export async function updateMe(id: string, data: UpdateMeInput) {
  const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export async function updateProfile(id: string, role: Role, data: Record<string, unknown>) {
  const key =
    role === 'PATIENT'
      ? 'patientProfile'
      : role === 'PMV'
        ? 'pmvProfile'
        : role === 'DOCTOR'
          ? 'doctorProfile'
          : null;
  if (!key) throw new ApiError(400, 'This role has no editable profile');
  const user = await User.findByIdAndUpdate(id, { $set: { [key]: data } }, { new: true }).select(
    '-passwordHash',
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export async function registerPushToken(id: string, token: string) {
  await User.findByIdAndUpdate(id, { $addToSet: { pushTokens: token } });
  return { registered: true };
}

export async function setTwoFactor(id: string, enabled: boolean) {
  const user = await User.findByIdAndUpdate(id, { $set: { twoFactorEnabled: enabled } }, { new: true }).select(
    '-passwordHash',
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}
