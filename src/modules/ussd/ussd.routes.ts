import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ussdHandler } from './ussd.controller';

const router = Router();

// Public gateway callback (no auth; the telco calls this).
router.post('/', asyncHandler(ussdHandler));

export default router;
