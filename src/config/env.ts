import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: required('MONGODB_URI'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '2h',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',
  // Africa's Talking USSD/SMS. Leave unset to run in safe no-op mode (logs only).
  africasTalking: {
    username: process.env.AT_USERNAME ?? 'sandbox',
    apiKey: process.env.AT_API_KEY ?? '',
    senderId: process.env.AT_SENDER_ID ?? '',
    baseUrl: process.env.AT_BASE_URL ?? 'https://api.sandbox.africastalking.com/version1',
    get enabled() {
      return Boolean(process.env.AT_API_KEY);
    },
  },
  // Email (OTP and notifications) over SMTP. Works with Gmail, Brevo, or any SMTP.
  // Leave unset to run in safe no-op mode (logs only).
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? 'MediOrb <no-reply@mediorb.app>',
    get enabled() {
      return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    },
  },
};
