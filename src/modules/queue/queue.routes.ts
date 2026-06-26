import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { joinQueueSchema, updateQueueStatusSchema } from './queue.validation';
import { joinHandler, listHandler, getHandler, updateStatusHandler } from './queue.controller';

const router = Router();

router.post('/join', requireAuth, validate(joinQueueSchema), asyncHandler(joinHandler));
router.get('/', requireAuth, asyncHandler(listHandler));
router.get('/:id', requireAuth, asyncHandler(getHandler));
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  validate(updateQueueStatusSchema),
  asyncHandler(updateStatusHandler),
);

export default router;
