import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createGuideSchema, updateGuideSchema } from './guide.validation';
import { listHandler, getHandler, createHandler, updateHandler, deleteHandler } from './guide.controller';

const router = Router();

// Public reads so patients can browse content.
router.get('/', asyncHandler(listHandler));
router.get('/:id', asyncHandler(getHandler));

// Admin manages content.
router.post('/', requireAuth, requireRole('ADMIN'), validate(createGuideSchema), asyncHandler(createHandler));
router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(updateGuideSchema), asyncHandler(updateHandler));
router.delete('/:id', requireAuth, requireRole('ADMIN'), asyncHandler(deleteHandler));

export default router;
