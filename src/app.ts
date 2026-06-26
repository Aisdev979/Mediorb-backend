import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import appointmentRoutes from './modules/appointments/appointments.routes';
import queueRoutes from './modules/queue/queue.routes';
import pmvRoutes from './modules/pmv/pmv.routes';
import consultationRoutes from './modules/consultation/consultation.routes';
import prescriptionRoutes from './modules/prescriptions/prescriptions.routes';
import recordRoutes from './modules/records/records.routes';
import healthCardRoutes from './modules/records/healthcard.routes';
import ussdRoutes from './modules/ussd/ussd.routes';
import reminderRoutes from './modules/reminders/reminders.routes';
import guideRoutes from './modules/guide/guide.routes';
import adminRoutes from './modules/admin/admin.routes';
import verificationRoutes from './modules/verification/verification.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import supportRoutes from './modules/support/support.routes';
import messagingRoutes from './modules/messaging/messaging.routes';
import { notFound, errorHandler } from './middleware/error';

import { swaggerSpec } from './swagger';
import swaggerUi from 'swagger-ui-express';

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mediorb-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/pmv', pmvRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/health-card', healthCardRoutes);
  app.use('/api/ussd', ussdRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/guide', guideRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/verification', verificationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/sms', messagingRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
