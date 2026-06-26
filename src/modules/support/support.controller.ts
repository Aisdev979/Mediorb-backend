import { Request, Response } from 'express';
import * as supportService from './support.service';

export const createHandler = async (req: Request, res: Response) => {
  res.status(201).json(await supportService.createTicket(req.user!.id, req.body));
};

export const mineHandler = async (req: Request, res: Response) => {
  res.json(await supportService.listOwn(req.user!.id));
};

export const listHandler = async (req: Request, res: Response) => {
  res.json(await supportService.listAll(req.query.status as string | undefined));
};

export const updateHandler = async (req: Request, res: Response) => {
  res.json(await supportService.updateStatus(req.params.id, req.body.status));
};
