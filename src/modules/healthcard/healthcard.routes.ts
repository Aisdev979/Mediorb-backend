import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { verifyCardSchema } from './healthcard.validation';
import { issueHandler, getHandler, verifyHandler } from './healthcard.controller';

const router = Router();

// Verify is public on purpose: a responder checks a scanned card offline.
router.post('/verify', validate(verifyCardSchema), asyncHandler(verifyHandler));

router.post(
  '/:patientId/issue',
  requireAuth,
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  asyncHandler(issueHandler),
);
router.get('/:patientId', requireAuth, asyncHandler(getHandler));

export default router;
