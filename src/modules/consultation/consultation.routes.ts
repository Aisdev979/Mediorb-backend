import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import {
  createConsultationSchema,
  updateConsultationSchema,
  consultationMessageSchema,
} from './consultation.validation';
import {
  createHandler,
  listHandler,
  getHandler,
  updateHandler,
  messageHandler,
} from './consultation.controller';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  validate(createConsultationSchema),
  asyncHandler(createHandler),
);
router.get('/', asyncHandler(listHandler));
router.get('/:id', asyncHandler(getHandler));
router.patch(
  '/:id',
  requireRole('DOCTOR', 'ADMIN'),
  validate(updateConsultationSchema),
  asyncHandler(updateHandler),
);
router.post('/:id/messages', validate(consultationMessageSchema), asyncHandler(messageHandler));

export default router;
