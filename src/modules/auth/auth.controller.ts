import { Request, Response } from 'express';
import * as authService from './auth.service';

export const registerHandler = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
};

export const verifyOtpHandler = async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body);
  res.json(result);
};

export const loginHandler = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
};

export const refreshHandler = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json(result);
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const result = await authService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  res.json(result);
};
