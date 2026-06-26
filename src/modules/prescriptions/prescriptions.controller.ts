import { Request, Response } from 'express';
import * as prescriptionsService from './prescriptions.service';

export const createHandler = async (req: Request, res: Response) => {
  const p = await prescriptionsService.createPrescription(req.user!.id, req.user!.role, req.body);
  res.status(201).json(p);
};

export const listHandler = async (req: Request, res: Response) => {
  const patientId = req.query.patientId as string | undefined;
  res.json(await prescriptionsService.listPrescriptions(req.user!.id, req.user!.role, patientId));
};

export const getHandler = async (req: Request, res: Response) => {
  res.json(await prescriptionsService.getById(req.params.id));
};
