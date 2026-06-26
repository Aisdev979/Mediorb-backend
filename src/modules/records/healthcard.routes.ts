import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { verifyCardSchema } from './records.validation';
import {
  issueCardHandler,
  getCardHandler,
  publicKeyHandler,
  verifyCardHandler,
} from './records.controller';

const router = Router();

// Public routes first, so they are not captured by the :patientId param route.
router.get('/public-key', asyncHandler(publicKeyHandler));
router.post('/verify', validate(verifyCardSchema), asyncHandler(verifyCardHandler));

// Issue or fetch a patient's signed card.
router.post(
  '/:patientId',
  requireAuth,
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  asyncHandler(issueCardHandler),
);
router.get('/:patientId', requireAuth, asyncHandler(getCardHandler));

export default router;
