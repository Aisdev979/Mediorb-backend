import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { inboundHandler, sendHandler } from './messaging.controller';

const router = Router();

// Public webhook for the telco gateway.
router.post('/inbound', asyncHandler(inboundHandler));
// Admin-only manual send, handy for testing the integration.
router.post('/send', requireAuth, requireRole('ADMIN'), asyncHandler(sendHandler));

export default router;
