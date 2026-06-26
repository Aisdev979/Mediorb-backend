import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createRecordSchema } from './records.validation';
import { createRecordHandler, listRecordsHandler } from './records.controller';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  validate(createRecordSchema),
  asyncHandler(createRecordHandler),
);
router.get('/:patientId', asyncHandler(listRecordsHandler));

export default router;
