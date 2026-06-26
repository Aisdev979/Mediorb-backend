import { Request, Response } from 'express';
import * as pmvService from './pmv.service';

export const registerWalkInHandler = async (req: Request, res: Response) => {
  const result = await pmvService.registerWalkIn(req.body);
  res.status(201).json(result);
};

export const lookupPatientsHandler = async (req: Request, res: Response) => {
  const search = (req.query.search ?? req.query.phone) as string | undefined;
  res.json(await pmvService.lookupPatients(search));
};

export const activityHandler = async (req: Request, res: Response) => {
  res.json(await pmvService.getActivity(req.user!.id));
};
