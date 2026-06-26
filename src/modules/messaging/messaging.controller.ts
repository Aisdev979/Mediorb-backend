import { Request, Response } from 'express';
import * as messaging from './messaging.service';

// Africa's Talking inbound SMS webhook (public; the gateway calls this).
export const inboundHandler = async (req: Request, res: Response) => {
  const from = (req.body.from as string) ?? '';
  const text = (req.body.text as string) ?? '';
  await messaging.handleInboundSms({ from, text });
  res.set('Content-Type', 'text/plain');
  res.send('OK');
};

// Admin test endpoint to fire a one-off SMS.
export const sendHandler = async (req: Request, res: Response) => {
  const { to, message } = req.body as { to: string; message: string };
  res.json(await messaging.sendSms(to, message));
};
