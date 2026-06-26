import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import {
  createConsultationSchema,
  updateConsultationSchema,
  consultationMessageSchema,
} from './consultations.validation';
import {
  createHandler,
  listHandler,
  getHandler,
  updateHandler,
  messageHandler,
} from './consultations.controller';

const router = Router();

router.post(
  '/',
  requireAuth,
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  validate(createConsultationSchema),
  asyncHandler(createHandler),
);
router.get('/', requireAuth, asyncHandler(listHandler));
router.get('/:id', requireAuth, asyncHandler(getHandler));
router.patch(
  '/:id',
  requireAuth,
  requireRole('DOCTOR', 'ADMIN'),
  validate(updateConsultationSchema),
  asyncHandler(updateHandler),
);
router.post(
  '/:id/messages',
  requireAuth,
  validate(consultationMessageSchema),
  asyncHandler(messageHandler),
);

export default router;
