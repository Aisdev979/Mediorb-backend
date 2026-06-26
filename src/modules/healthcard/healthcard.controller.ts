import { Request, Response } from 'express';
import * as healthcardService from './healthcard.service';

export const issueHandler = async (req: Request, res: Response) => {
  res.status(201).json(await healthcardService.issueCard(req.params.patientId));
};

export const getHandler = async (req: Request, res: Response) => {
  res.json(await healthcardService.getCard(req.params.patientId));
};

export const verifyHandler = async (req: Request, res: Response) => {
  const { payload, signature, publicKey } = req.body;
  res.json(healthcardService.verifyCard(payload, signature, publicKey));
};
