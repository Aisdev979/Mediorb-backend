import { Request, Response } from 'express';
import * as adminService from './admin.service';

export const statsHandler = async (_req: Request, res: Response) => {
  res.json(await adminService.getStats());
};

export const usersHandler = async (req: Request, res: Response) => {
  res.json(await adminService.listUsers(req.query.role as string | undefined));
};

export const appointmentsHandler = async (_req: Request, res: Response) => {
  res.json(await adminService.listAppointments());
};

export const createUserHandler = async (req: Request, res: Response) => {
  const result = await adminService.createUser(req.body);
  res.status(201).json(result);
};

export const setUserStatusHandler = async (req: Request, res: Response) => {
  res.json(await adminService.setUserStatus(req.params.id, Boolean(req.body.isActive)));
};
