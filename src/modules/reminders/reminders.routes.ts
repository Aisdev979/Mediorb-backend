import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createReminderSchema } from './reminders.validation';
import { createHandler, listHandler, sendHandler, runDueHandler } from './reminders.controller';

const router = Router();
router.use(requireAuth);

router.post('/run-due', requireRole('ADMIN'), asyncHandler(runDueHandler));
router.post(
  '/',
  requireRole('DOCTOR', 'PMV', 'ADMIN'),
  validate(createReminderSchema),
  asyncHandler(createHandler),
);
router.get('/', asyncHandler(listHandler));
router.post('/:id/send', requireRole('DOCTOR', 'PMV', 'ADMIN'), asyncHandler(sendHandler));

export default router;
