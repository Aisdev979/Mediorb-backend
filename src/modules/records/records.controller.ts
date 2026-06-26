import { Request, Response } from 'express';
import * as recordsService from './records.service';

export const createRecordHandler = async (req: Request, res: Response) => {
  res.status(201).json(await recordsService.createRecord(req.user!.id, req.body));
};

export const listRecordsHandler = async (req: Request, res: Response) => {
  res.json(await recordsService.listRecords(req.params.patientId));
};

export const issueCardHandler = async (req: Request, res: Response) => {
  res.status(201).json(await recordsService.issueHealthCard(req.params.patientId));
};

export const getCardHandler = async (req: Request, res: Response) => {
  res.json(await recordsService.getHealthCard(req.params.patientId));
};

export const publicKeyHandler = async (_req: Request, res: Response) => {
  res.json(recordsService.getPublicKey());
};

export const verifyCardHandler = async (req: Request, res: Response) => {
  res.json(recordsService.verifyCard(req.body.payload, req.body.signature));
};
