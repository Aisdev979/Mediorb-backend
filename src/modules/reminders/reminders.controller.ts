import { Request, Response } from 'express';
import * as remindersService from './reminders.service';

export const createHandler = async (req: Request, res: Response) => {
  res.status(201).json(await remindersService.createReminder(req.body));
};

export const listHandler = async (req: Request, res: Response) => {
  const patientId = req.query.patientId as string | undefined;
  res.json(await remindersService.listReminders(patientId));
};

export const sendHandler = async (req: Request, res: Response) => {
  res.json(await remindersService.sendReminder(req.params.id));
};

export const runDueHandler = async (_req: Request, res: Response) => {
  res.json(await remindersService.runDueReminders());
};
