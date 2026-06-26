import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  specialtiesHandler,
  hospitalsHandler,
  departmentsHandler,
  doctorsHandler,
} from './catalog.controller';

const router = Router();

router.get('/specialties', asyncHandler(specialtiesHandler));
router.get('/hospitals', asyncHandler(hospitalsHandler));
router.get('/hospitals/:id/departments', asyncHandler(departmentsHandler));
router.get('/doctors', asyncHandler(doctorsHandler));

export default router;
