import { OpenAPIV3 } from 'openapi-types';

const authRequired = [{ bearerAuth: [] }];

export const appointmentPaths: OpenAPIV3.PathsObject = {

  '/appointments': {
    post: {
      tags: ['Appointments'],
      summary: 'Book an appointment',
      description:
        'Creates a new appointment. Behaviour varies by the caller\'s role:\n\n' +
        '- **PATIENT** — books for themselves. The `patientId` field is ignored.\n' +
        '- **PMV** — may supply `patientId` to book on behalf of a walk-in patient. ' +
        'If omitted, the PMV themselves are set as the patient. `channel` is forced to `PMV`.\n' +
        '- All fields except `role` (from the token) are optional; the caller can ' +
        'supply as much or as little context as available at booking time.',
      security: authRequired,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateAppointmentRequest' },
            examples: {
              patientSelfBook: {
                summary: 'Patient books for themselves (minimal)',
                value: {
                  doctorId: '6650a1b2c3d4e5f6a7b8c9d3',
                  hospitalId: '6650a1b2c3d4e5f6a7b8c9d4',
                  scheduledAt: '2025-09-01T09:00:00.000Z',
                  reason: 'Persistent headache for two weeks.',
                },
              },
              pmvWalkIn: {
                summary: 'PMV books for a walk-in patient',
                value: {
                  patientId: '6650a1b2c3d4e5f6a7b8c9d6',
                  doctorId: '6650a1b2c3d4e5f6a7b8c9d3',
                  hospitalId: '6650a1b2c3d4e5f6a7b8c9d4',
                  preferredLanguage: 'YORUBA',
                  reason: 'Walk-in: fever and chills.',
                },
              },
              ussdBook: {
                summary: 'Booked via USSD (no doctor pre-selected)',
                value: {
                  hospitalId: '6650a1b2c3d4e5f6a7b8c9d4',
                  specialtyId: '6650a1b2c3d4e5f6a7b8c9d5',
                  channel: 'USSD',
                  preferredLanguage: 'HAUSA',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Appointment created.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Appointment' },
              example: {
                _id: '6650a1b2c3d4e5f6a7b8c9d1',
                patient: '6650a1b2c3d4e5f6a7b8c9d0',
                doctor: '6650a1b2c3d4e5f6a7b8c9d3',
                hospital: '6650a1b2c3d4e5f6a7b8c9d4',
                channel: 'APP',
                status: 'PENDING',
                preferredLanguage: 'ENGLISH',
                scheduledAt: '2025-09-01T09:00:00.000Z',
                reason: 'Persistent headache for two weeks.',
                createdAt: '2025-08-20T14:30:00.000Z',
                updatedAt: '2025-08-20T14:30:00.000Z',
              },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '422': {
          description: 'Validation error.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },

    get: {
      tags: ['Appointments'],
      summary: 'List appointments for the current user',
      description:
        'Returns appointments scoped to the caller\'s role:\n\n' +
        '- **PATIENT** — only their own appointments (populated with doctor name and specialty).\n' +
        '- **DOCTOR** — only appointments where they are the assigned doctor (populated with patient name and phone).\n' +
        '- **ADMIN / PMV** — all appointments, capped at 200, most recent first.\n\n' +
        'All results are sorted by `createdAt` descending.',
      security: authRequired,
      responses: {
        '200': {
          description: 'Array of appointments.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/appointments/{id}': {
    get: {
      tags: ['Appointments'],
      summary: 'Get a single appointment',
      description:
        'Fetches a single appointment by its MongoDB ObjectId. ' +
        'Patient, doctor, specialty, and department fields are populated.',
      security: authRequired,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'MongoDB ObjectId of the appointment.',
          schema: { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d1' },
        },
      ],
      responses: {
        '200': {
          description: 'Appointment document.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Appointment' },
            },
          },
        },
        '404': {
          description: 'Appointment not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'Appointment not found' },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/appointments/{id}/status': {
    patch: {
      tags: ['Appointments'],
      summary: 'Update appointment status',
      description:
        'Transitions an appointment to a new status. ' +
        'Valid statuses: `PENDING` → `CONFIRMED` → `COMPLETED` or `CANCELLED`.\n\n' +
        'A best-effort in-app notification is sent to the patient after every status ' +
        'change. Notification failures do not block the status update.',
      security: authRequired,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'MongoDB ObjectId of the appointment.',
          schema: { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d1' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAppointmentStatusRequest' },
            examples: {
              confirm:   { summary: 'Confirm',   value: { status: 'CONFIRMED'  } },
              complete:  { summary: 'Complete',  value: { status: 'COMPLETED'  } },
              cancel:    { summary: 'Cancel',    value: { status: 'CANCELLED'  } },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated appointment document.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Appointment' },
            },
          },
        },
        '404': {
          description: 'Appointment not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'Appointment not found' },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '422': {
          description: 'Invalid status value.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },
};