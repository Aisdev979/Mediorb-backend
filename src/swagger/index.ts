import { OpenAPIV3 } from 'openapi-types';
import { schemas }          from './schemas';
import { authPaths }        from './paths/auth.path';
import { adminPaths }       from './paths/admin.path';
import { appointmentPaths } from './paths/appointment.path';

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',

  info: {
    title: 'MediOrb API',
    version: '1.0.0',
    description:
      'REST API for the MediOrb Nigerian healthcare platform.\n\n' +
      '## Authentication\n' +
      'Most endpoints require a Bearer token. Obtain one via `POST /auth/login` or ' +
      '`POST /auth/verify-otp`. Pass it as:\n' +
      '```\nAuthorization: Bearer <accessToken>\n```\n\n' +
      '## Roles\n' +
      '| Role | Description |\n' +
      '|------|-------------|\n' +
      '| `PATIENT` | End-user booking appointments |\n' +
      '| `PMV` | Patent Medicine Vendor — books for walk-in patients |\n' +
      '| `DOCTOR` | Receives and manages appointments |\n' +
      '| `ADMIN` | Full platform access |\n\n' +
      '## OTP Flow\n' +
      '1. Register → OTP sent via SMS + email\n' +
      '2. `POST /auth/verify-otp` → receives tokens\n' +
      '3. Login with 2FA enabled → OTP challenge → `POST /auth/verify-otp` → tokens',
    contact: {
      name: 'MediOrb Engineering',
      email: 'engineering@mediorg.ng',
    },
  },

  servers: [
    { url: 'http://localhost:4000/api/', description: 'Local dev', variables: { port: { default: '4000' } } },
    { url: 'https://api.mediorg.ng/api/v1', description: 'Production' },
  ],

  tags: [
    { name: 'Auth',         description: 'Registration, OTP verification, login, token refresh' },
    { name: 'Admin',        description: 'Admin-only platform management endpoints' },
    { name: 'Appointments', description: 'Book and manage appointments' },
  ],

  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from `/auth/login` or `/auth/verify-otp`.',
      },
    },
  },

  paths: {
    ...authPaths,
    ...adminPaths,
    ...appointmentPaths,
  },
};