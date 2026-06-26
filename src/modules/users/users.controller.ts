import { Request, Response } from 'express';
import * as usersService from './users.service';

export const getMeHandler = async (req: Request, res: Response) => {
  const user = await usersService.getMe(req.user!.id);
  res.json(user);
};

export const updateMeHandler = async (req: Request, res: Response) => {
  const user = await usersService.updateMe(req.user!.id, req.body);
  res.json(user);
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const user = await usersService.updateProfile(req.user!.id, req.user!.role, req.body);
  res.json(user);
};

export const registerPushTokenHandler = async (req: Request, res: Response) => {
  res.json(await usersService.registerPushToken(req.user!.id, req.body.token));
};

export const setTwoFactorHandler = async (req: Request, res: Response) => {
  res.json(await usersService.setTwoFactor(req.user!.id, Boolean(req.body.enabled)));
};
