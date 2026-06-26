import { Request, Response } from 'express';
import * as catalogService from './catalog.service';

export const specialtiesHandler = async (_req: Request, res: Response) => {
  res.json(await catalogService.listSpecialties());
};

export const hospitalsHandler = async (_req: Request, res: Response) => {
  res.json(await catalogService.listHospitals());
};

export const departmentsHandler = async (req: Request, res: Response) => {
  res.json(await catalogService.listDepartments(req.params.id));
};

export const doctorsHandler = async (_req: Request, res: Response) => {
  res.json(await catalogService.listDoctors());
};
