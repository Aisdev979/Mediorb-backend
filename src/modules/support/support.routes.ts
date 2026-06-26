import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createTicketSchema, updateTicketSchema } from './support.validation';
import { createHandler, mineHandler, listHandler, updateHandler } from './support.controller';

const router = Router();
router.use(requireAuth);

router.post('/', validate(createTicketSchema), asyncHandler(createHandler));
router.get('/mine', asyncHandler(mineHandler));
router.get('/', requireRole('ADMIN'), asyncHandler(listHandler));
router.patch('/:id', requireRole('ADMIN'), validate(updateTicketSchema), asyncHandler(updateHandler));

export default router;
