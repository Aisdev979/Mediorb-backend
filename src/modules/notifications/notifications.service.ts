import { Notification } from '../../models/notification.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';

// Best-effort Expo push to all of a user's registered devices. Expo's push API
// is free and needs no credentials. Failures never block the in-app notification.
async function sendPush(userId: string, title: string, body: string) {
  try {
    const user = await User.findById(userId).select('pushTokens');
    const tokens: string[] = (user as any)?.pushTokens || [];
    if (!tokens.length) return;
    const messages = tokens
      .filter((t) => t.startsWith('ExponentPushToken'))
      .map((to) => ({ to, sound: 'default', title, body }));
    if (!messages.length) return;
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch {
    // ignore
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
) {
  const note = await Notification.create({ user: userId, type, title, body });
  void sendPush(userId, title, body);
  return note;
}

export async function listForUser(userId: string) {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
}

export async function markRead(id: string, userId: string) {
  const n = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { isRead: true } },
    { new: true },
  );
  if (!n) throw new ApiError(404, 'Notification not found');
  return n;
}
