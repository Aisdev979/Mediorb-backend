import { env } from '../../config/env';

// Sends an SMS through Africa's Talking when credentials are present.
// Without credentials it logs and returns, so the rest of the app works
// unchanged and the integration can be switched on later by setting env vars.
export async function sendSms(to: string, message: string): Promise<{ sent: boolean }> {
  if (!env.africasTalking.enabled) {
    console.log(`[SMS:noop] ${to} -> ${message}`);
    return { sent: false };
  }
  try {
    const body = new URLSearchParams({
      username: env.africasTalking.username,
      to,
      message,
    });
    if (env.africasTalking.senderId) body.set('from', env.africasTalking.senderId);

    const res = await fetch(`${env.africasTalking.baseUrl}/messaging`, {
      method: 'POST',
      headers: {
        apiKey: env.africasTalking.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) {
      console.error('[SMS] send failed', res.status, await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    console.error('[SMS] error', e);
    return { sent: false };
  }
}

// Handles an inbound SMS callback from Africa's Talking. Extend with keyword
// commands (e.g. "QUEUE", "CARD") as the SMS workflow grows.
export async function handleInboundSms(input: { from: string; text: string }) {
  console.log(`[SMS:inbound] ${input.from}: ${input.text}`);
  return { received: true };
}
