import { User } from '../../models/user.model';
import { sendSms } from '../messaging/messaging.service';
import { sendEmail } from '../messaging/email.service';
import { OtpCode } from '../../models/otp.model';
import { ApiError } from '../../utils/apiError';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateOtp, hashOtp, verifyOtp as checkOtp } from '../../utils/otp';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  Role,
} from '../../utils/jwt';
import { RegisterInput, LoginInput, VerifyOtpInput } from './auth.validation';
import { env } from '../../config/env';

const OTP_TTL_MINUTES = 10;

function tokensFor(id: string, role: Role) {
  return {
    accessToken: signAccessToken({ sub: id, role }),
    refreshToken: signRefreshToken({ sub: id, role }),
  };
}

async function issueOtp(phone: string, email?: string): Promise<string> {
  const code = generateOtp();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await OtpCode.create({ phone, codeHash, purpose: 'PHONE_VERIFICATION', expiresAt });
  console.log(`[OTP] ${phone} -> ${code}`);
  // Same code goes to every available channel. Each is best-effort and a no-op
  // until its service is set (Africa's Talking for SMS, SMTP for email).
  const message = `Your MediOrb verification code is ${code}`;
  void sendSms(phone, message);
  if (email) {
    void sendEmail(
      email,
      'Your MediOrb verification code',
      `${message}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      `<p>Your MediOrb verification code is <b style="font-size:18px">${code}</b>.</p><p>It expires in ${OTP_TTL_MINUTES} minutes.</p>`,
    );
  }
  return code;
}

export async function register(input: RegisterInput) {
  const existing = await User.findOne({ phone: input.phone });
  if (existing) throw new ApiError(409, 'Phone number already registered');
  const emailTaken = await User.findOne({ email: input.email.toLowerCase() });
  if (emailTaken) throw new ApiError(409, 'Email already registered');

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    role: input.role,
    phone: input.phone,
    email: input.email.toLowerCase(),
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
    preferredLanguage: input.preferredLanguage ?? 'ENGLISH',
  });

  const code = await issueOtp(user.phone, user.email ?? undefined);
  return {
    userId: String(user._id),
    message: 'Registered. Verify the OTP sent to your phone.',
    devOtp: env.isDev ? code : undefined,
  };
}

export async function verifyOtp(input: VerifyOtpInput) {
  const otp = await OtpCode.findOne({
    phone: input.phone,
    purpose: 'PHONE_VERIFICATION',
    consumedAt: { $exists: false },
  }).sort({ createdAt: -1 });

  if (!otp) throw new ApiError(400, 'No pending OTP for this phone');
  if (otp.expiresAt.getTime() < Date.now()) throw new ApiError(400, 'OTP expired');

  const ok = await checkOtp(input.code, otp.codeHash);
  if (!ok) throw new ApiError(400, 'Incorrect OTP');

  otp.consumedAt = new Date();
  await otp.save();

  const user = await User.findOne({ phone: input.phone });
  if (!user) throw new ApiError(404, 'User not found');
  user.isPhoneVerified = true;
  await user.save();

  return { user: publicUser(user), ...tokensFor(String(user._id), user.role as Role) };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials');
  if (user.isActive === false) throw new ApiError(403, 'This account has been deactivated.');

  // Two-factor: issue an OTP and stop short of tokens. The client then verifies
  // the code via the existing verify-otp endpoint to receive tokens.
  if (user.twoFactorEnabled) {
    const code = await issueOtp(user.phone, user.email ?? undefined);
    return { requires2fa: true, phone: user.phone, devOtp: env.isDev ? code : undefined };
  }

  return { user: publicUser(user), ...tokensFor(String(user._id), user.role as Role) };
}

export async function refresh(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    return { accessToken: signAccessToken({ sub: payload.sub, role: payload.role }) };
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }
}

export function publicUser(user: {
  _id: unknown;
  role: string;
  phone: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  isPhoneVerified: boolean;
}) {
  return {
    id: String(user._id),
    role: user.role,
    phone: user.phone,
    email: user.email ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    preferredLanguage: user.preferredLanguage,
    isPhoneVerified: user.isPhoneVerified,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw new ApiError(400, 'Current password is incorrect');
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  return { message: 'Password updated' };
}
