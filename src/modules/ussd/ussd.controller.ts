import { Request, Response } from 'express';
import * as ussdService from './ussd.service';

// Africa's Talking expects a plain-text response, not JSON.
export const ussdHandler = async (req: Request, res: Response) => {
  const sessionId = (req.body.sessionId as string) ?? '';
  const phoneNumber = (req.body.phoneNumber as string) ?? '';
  const text = (req.body.text as string) ?? '';
  const response = await ussdService.handleUssd({ sessionId, phoneNumber, text });
  res.set('Content-Type', 'text/plain');
  res.send(response);
};
