import { Request, Response } from 'express';
import * as queueService from './queue.service';
import { QueueStatus } from '../../models/queueEntry.model';

export const joinHandler = async (req: Request, res: Response) => {
  const role = req.user!.role;
  const patientId =
    (role === 'PMV' || role === 'ADMIN') && req.body.patientId
      ? (req.body.patientId as string)
      : req.user!.id;
  const entry = await queueService.joinQueue(patientId, req.body);
  res.status(201).json(entry);
};

export const listHandler = async (req: Request, res: Response) => {
  const departmentId = req.query.departmentId as string | undefined;
  const status = req.query.status as QueueStatus | undefined;
  res.json(await queueService.listQueue(departmentId, status));
};

export const getHandler = async (req: Request, res: Response) => {
  res.json(await queueService.getQueueEntry(req.params.id));
};

export const updateStatusHandler = async (req: Request, res: Response) => {
  res.json(await queueService.updateQueueStatus(req.params.id, req.body.status));
};
