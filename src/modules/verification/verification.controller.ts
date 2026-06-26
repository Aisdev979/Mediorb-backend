import { Request, Response } from 'express';
import * as verificationService from './verification.service';

export const submitHandler = async (req: Request, res: Response) => {
  res.status(201).json(await verificationService.submitDocument(req.user!.id, req.body));
};

export const listHandler = async (req: Request, res: Response) => {
  res.json(await verificationService.listDocuments(req.query.status as string | undefined));
};

export const mineHandler = async (req: Request, res: Response) => {
  res.json(await verificationService.listOwnDocuments(req.user!.id));
};

export const reviewHandler = async (req: Request, res: Response) => {
  res.json(await verificationService.reviewDocument(req.params.id, req.user!.id, req.body.status));
};
