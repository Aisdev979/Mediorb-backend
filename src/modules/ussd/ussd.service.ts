import { User } from '../../models/user.model';
import { Appointment } from '../../models/appointment.model';
import { QueueEntry } from '../../models/queueEntry.model';
import { UssdSession } from '../../models/ussdSession.model';

interface UssdInput {
  sessionId: string;
  phoneNumber: string;
  text: string;
}

const SERVICES = ['General consultation', 'Maternity', 'Pharmacy'];
const MAIN_MENU = 'CON Welcome to MediOrb\n1. Book a consultation\n2. Check my queue\n3. My health info';

// Africa's Talking sends the full accumulated text each callback, joined by '*'.
// Reply with 'CON ...' to continue the session or 'END ...' to finish it.
export async function handleUssd(input: UssdInput): Promise<string> {
  const { sessionId, phoneNumber, text } = input;
  const steps = text.split('*').filter((s) => s.length > 0);

  try {
    const sid = sessionId || `${phoneNumber}-${Date.now()}`;
    await UssdSession.findOneAndUpdate(
      { sessionId: sid },
      { sessionId: sid, phone: phoneNumber, state: text || 'START' },
      { upsert: true },
    );
  } catch {
    // session logging is best-effort
  }

  if (steps.length === 0) return MAIN_MENU;

  const user = await User.findOne({ phone: phoneNumber, role: 'PATIENT' });

  // 1. Book a consultation
  if (steps[0] === '1') {
    if (steps.length === 1) {
      return 'CON Select service:\n1. General consultation\n2. Maternity\n3. Pharmacy';
    }
    if (!user) return 'END You are not registered. Please visit a MediOrb chemist to register.';

    const service = SERVICES[Number(steps[1]) - 1] ?? SERVICES[0];
    const appointment = await Appointment.create({
      patient: user._id,
      channel: 'USSD',
      status: 'CONFIRMED',
      preferredLanguage: user.preferredLanguage,
    });
    const waiting = await QueueEntry.countDocuments({ status: 'WAITING' });
    const position = waiting + 1;
    const queueNumber = 'Q' + String(position).padStart(3, '0');
    await QueueEntry.create({
      appointment: appointment._id,
      patient: user._id,
      queueNumber,
      position,
      status: 'WAITING',
      estimatedWaitMinutes: position * 10,
    });
    return `END Booked for ${service}. Your number is ${queueNumber}, position ${position}. We will SMS you when it is your turn.`;
  }

  // 2. Check my queue
  if (steps[0] === '2') {
    if (!user) return 'END You are not registered.';
    const entry = await QueueEntry.findOne({
      patient: user._id,
      status: { $in: ['WAITING', 'IN_CONSULTATION'] },
    }).sort({ createdAt: -1 });
    if (!entry) return 'END You have no active queue entry.';
    return `END Queue ${entry.queueNumber}, position ${entry.position}, about ${entry.estimatedWaitMinutes ?? 0} minutes.`;
  }

  // 3. My health info
  if (steps[0] === '3') {
    if (!user) return 'END You are not registered.';
    const profile = (user.patientProfile ?? {}) as any;
    const allergies = (profile.allergies ?? []).join(', ') || 'none';
    return `END ${user.firstName} ${user.lastName}. Blood group: ${profile.bloodGroup ?? 'N/A'}. Allergies: ${allergies}.`;
  }

  return 'END Invalid choice. Please dial again.';
}
