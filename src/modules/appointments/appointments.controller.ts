import { Request, Response } from 'express';
import * as appointmentsService from './appointments.service';

export const createHandler = async (req: Request, res: Response) => {
  const appt = await appointmentsService.createAppointment(req.user!.id, req.user!.role, req.body);
  res.status(201).json(appt);
};

export const listHandler = async (req: Request, res: Response) => {
  const appts = await appointmentsService.listForUser(req.user!.id, req.user!.role);
  res.json(appts);
};

export const getHandler = async (req: Request, res: Response) => {
  res.json(await appointmentsService.getById(req.params.id));
};

export const updateStatusHandler = async (req: Request, res: Response) => {
  res.json(await appointmentsService.updateStatus(req.params.id, req.body.status));
};
