import { Request, Response } from 'express';
import * as consultationsService from './consultations.service';

export const createHandler = async (req: Request, res: Response) => {
  const c = await consultationsService.createConsultation(req.user!.id, req.user!.role, req.body);
  res.status(201).json(c);
};

export const listHandler = async (req: Request, res: Response) => {
  res.json(await consultationsService.listForUser(req.user!.id, req.user!.role));
};

export const getHandler = async (req: Request, res: Response) => {
  res.json(await consultationsService.getById(req.params.id));
};

export const updateHandler = async (req: Request, res: Response) => {
  res.json(await consultationsService.update(req.params.id, req.body));
};

export const messageHandler = async (req: Request, res: Response) => {
  const msg = await consultationsService.addMessage(req.params.id, req.user!.id, req.body.body);
  res.status(201).json(msg);
};
