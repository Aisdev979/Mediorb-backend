import nodemailer from 'nodemailer';
import { env } from '../../config/env';

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!env.smtp.enabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

// Sends an email when SMTP is configured. Without it, logs and returns, so the
// rest of the app works unchanged and email can be switched on later via env.
export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<{ sent: boolean }> {
  const t = getTransporter();
  if (!t || !to) {
    console.log(`[EMAIL:noop] ${to} -> ${subject}`);
    return { sent: false };
  }
  try {
    await t.sendMail({ from: env.smtp.from, to, subject, text, html: html ?? text });
    return { sent: true };
  } catch (e) {
    console.error('[EMAIL] send failed', e);
    return { sent: false };
  }
}
