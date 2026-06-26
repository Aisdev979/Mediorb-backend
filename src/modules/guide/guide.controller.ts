import { Request, Response } from 'express';
import * as guideService from './guide.service';

export const listHandler = async (req: Request, res: Response) => {
  res.json(
    await guideService.listGuides({
      condition: req.query.condition as string | undefined,
      period: req.query.period as string | undefined,
      language: req.query.language as string | undefined,
    }),
  );
};

export const getHandler = async (req: Request, res: Response) => {
  res.json(await guideService.getGuide(req.params.id));
};

export const createHandler = async (req: Request, res: Response) => {
  res.status(201).json(await guideService.createGuide(req.body));
};

export const updateHandler = async (req: Request, res: Response) => {
  res.json(await guideService.updateGuide(req.params.id, req.body));
};

export const deleteHandler = async (req: Request, res: Response) => {
  res.json(await guideService.deleteGuide(req.params.id));
};
