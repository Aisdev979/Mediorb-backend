import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { updateMeSchema, updateProfileSchema } from './users.validation';
import { getMeHandler, updateMeHandler, updateProfileHandler, registerPushTokenHandler, setTwoFactorHandler } from './users.controller';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getMeHandler));
router.patch('/me', requireAuth, validate(updateMeSchema), asyncHandler(updateMeHandler));
router.patch(
  '/me/profile',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(updateProfileHandler),
);

router.post('/me/push-token', requireAuth, asyncHandler(registerPushTokenHandler));
router.patch('/me/2fa', requireAuth, asyncHandler(setTwoFactorHandler));

export default router;
