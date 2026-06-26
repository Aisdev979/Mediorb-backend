import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createPrescriptionSchema } from './prescriptions.validation';
import { createHandler, listHandler, getHandler } from './prescriptions.controller';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  requireRole('DOCTOR', 'ADMIN'),
  validate(createPrescriptionSchema),
  asyncHandler(createHandler),
);
router.get('/', asyncHandler(listHandler));
router.get('/:id', asyncHandler(getHandler));

export default router;
