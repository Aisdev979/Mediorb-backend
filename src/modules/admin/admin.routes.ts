import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { statsHandler, usersHandler, appointmentsHandler, createUserHandler, setUserStatusHandler } from './admin.controller';
import { createUserSchema } from './admin.validation';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', asyncHandler(statsHandler));
router.get('/users', asyncHandler(usersHandler));
router.post('/users', validate(createUserSchema), asyncHandler(createUserHandler));
router.patch('/users/:id/status', asyncHandler(setUserStatusHandler));
router.get('/appointments', asyncHandler(appointmentsHandler));

export default router;
