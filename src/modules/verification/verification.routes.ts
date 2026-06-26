import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { submitDocumentSchema, reviewDocumentSchema } from './verification.validation';
import { submitHandler, listHandler, mineHandler, reviewHandler } from './verification.controller';

const router = Router();
router.use(requireAuth);

router.post(
  '/documents',
  requireRole('DOCTOR', 'PMV'),
  validate(submitDocumentSchema),
  asyncHandler(submitHandler),
);
router.get('/documents/mine', asyncHandler(mineHandler));
router.get('/documents', requireRole('ADMIN'), asyncHandler(listHandler));
router.patch(
  '/documents/:id',
  requireRole('ADMIN'),
  validate(reviewDocumentSchema),
  asyncHandler(reviewHandler),
);

export default router;
