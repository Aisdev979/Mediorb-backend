import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { listHandler, readHandler } from './notifications.controller';

const router = Router();

router.get('/', requireAuth, asyncHandler(listHandler));
router.patch('/:id/read', requireAuth, asyncHandler(readHandler));

export default router;
