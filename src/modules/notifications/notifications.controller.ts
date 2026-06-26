import { Request, Response } from 'express';
import * as notificationsService from './notifications.service';

export const listHandler = async (req: Request, res: Response) => {
  res.json(await notificationsService.listForUser(req.user!.id));
};

export const readHandler = async (req: Request, res: Response) => {
  res.json(await notificationsService.markRead(req.params.id, req.user!.id));
};
