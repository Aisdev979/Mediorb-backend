import { Reminder } from '../../models/reminder.model';
import { ApiError } from '../../utils/apiError';
import { CreateReminderInput } from './reminders.validation';

export async function createReminder(input: CreateReminderInput) {
  return Reminder.create({
    patient: input.patientId,
    message: input.message,
    channel: input.channel ?? 'SMS',
    scheduledAt: new Date(input.scheduledAt),
    status: 'SCHEDULED',
  });
}

export async function listReminders(patientId?: string) {
  const query: Record<string, unknown> = {};
  if (patientId) query.patient = patientId;
  return Reminder.find(query).sort({ scheduledAt: 1 }).limit(200);
}

// Demo mode: "send" by marking SENT and logging. A real SMS or push call goes here.
export async function sendReminder(id: string) {
  const reminder = await Reminder.findById(id);
  if (!reminder) throw new ApiError(404, 'Reminder not found');
  reminder.status = 'SENT';
  reminder.sentAt = new Date();
  await reminder.save();
  console.log(`[reminder] ${reminder.channel} to ${String(reminder.patient)}: ${reminder.message}`);
  return reminder;
}

// Fire every reminder that is due now. Call this during the demo instead of a cron.
export async function runDueReminders() {
  const now = new Date();
  const due = await Reminder.find({ status: 'SCHEDULED', scheduledAt: { $lte: now } });
  for (const r of due) {
    r.status = 'SENT';
    r.sentAt = now;
    await r.save();
    console.log(`[reminder] ${r.channel} to ${String(r.patient)}: ${r.message}`);
  }
  return { sent: due.length };
}
