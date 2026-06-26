import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { registerWalkInSchema } from './pmv.validation';
import { registerWalkInHandler, lookupPatientsHandler, activityHandler } from './pmv.controller';

const router = Router();

router.use(requireAuth, requireRole('PMV', 'ADMIN'));

router.post('/patients', validate(registerWalkInSchema), asyncHandler(registerWalkInHandler));
router.get('/patients', asyncHandler(lookupPatientsHandler));
router.get('/activity', asyncHandler(activityHandler));

export default router;
