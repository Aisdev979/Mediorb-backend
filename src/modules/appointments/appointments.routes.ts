import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from './appointments.validation';
import {
  createHandler,
  listHandler,
  getHandler,
  updateStatusHandler,
} from './appointments.controller';

const router = Router();

router.post('/', requireAuth, validate(createAppointmentSchema), asyncHandler(createHandler));
router.get('/', requireAuth, asyncHandler(listHandler));
router.get('/:id', requireAuth, asyncHandler(getHandler));
router.patch(
  '/:id/status',
  requireAuth,
  validate(updateAppointmentStatusSchema),
  asyncHandler(updateStatusHandler),
);

export default router;
