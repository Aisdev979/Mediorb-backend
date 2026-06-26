import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  refreshSchema,
  changePasswordSchema,
} from './auth.validation';
import {
  registerHandler,
  verifyOtpHandler,
  loginHandler,
  refreshHandler,
  changePasswordHandler,
} from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(registerHandler));
router.post('/verify-otp', validate(verifyOtpSchema), asyncHandler(verifyOtpHandler));
router.post('/login', validate(loginSchema), asyncHandler(loginHandler));
router.post('/refresh', validate(refreshSchema), asyncHandler(refreshHandler));
router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(changePasswordHandler),
);

export default router;
