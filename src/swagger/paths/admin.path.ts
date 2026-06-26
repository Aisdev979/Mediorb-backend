import { OpenAPIV3 } from 'openapi-types';

const adminSecurity = [{ bearerAuth: [] }];

const adminNote =
  '> **Access:** Requires a valid Bearer token whose role is `ADMIN`.';

export const adminPaths: OpenAPIV3.PathsObject = {

  '/admin/stats': {
    get: {
      tags: ['Admin'],
      summary: 'Platform statistics',
      description:
        `${adminNote}\n\n` +
        'Returns a snapshot of platform-wide counts: user breakdown by role, ' +
        'total appointments, live queue depth, consultations, and prescriptions. ' +
        'All counts are computed in a single parallel `Promise.all` call.',
      security: adminSecurity,
      responses: {
        '200': {
          description: 'Stats snapshot.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StatsResponse' },
              example: {
                users: { patients: 142, pmvs: 18, doctors: 34, admins: 3, total: 197 },
                appointments: 523,
                queue: { waiting: 7, inConsultation: 2 },
                consultations: 310,
                prescriptions: 281,
              },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '403': {
          description: 'Authenticated user is not an ADMIN.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/admin/users': {
    get: {
      tags: ['Admin'],
      summary: 'List users',
      description:
        `${adminNote}\n\n` +
        'Returns up to 500 users, sorted by `createdAt` descending. ' +
        'Password hashes are stripped from all results. ' +
        'Filter by role using the optional `role` query parameter.',
      security: adminSecurity,
      parameters: [
        {
          name: 'role',
          in: 'query',
          required: false,
          description: 'Filter by role. Omit to return all roles.',
          schema: { $ref: '#/components/schemas/Role' },
        },
      ],
      responses: {
        '200': {
          description: 'Array of user documents (passwordHash omitted).',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/PublicUser' },
              },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '403': {
          description: 'Authenticated user is not an ADMIN.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },

    post: {
      tags: ['Admin'],
      summary: 'Create a user account',
      description:
        `${adminNote}\n\n` +
        'Creates a verified user account without going through the public OTP flow — ' +
        'the admin is vouching for the account. The account is created with `isPhoneVerified: true`.\n\n' +
        '- If `password` is omitted a random 8-character temporary password is generated and ' +
        'returned in `temporaryPassword`. Hand this to the new user.\n' +
        '- For `DOCTOR` roles, include `specialtyId`, `hospitalId`, `licenseNumber`, `yearsExperience`, and `bio`. ' +
        'The doctor is automatically set to `verificationStatus: APPROVED`.\n' +
        '- For `PMV` roles, include `businessName`, `licenseNumber`, `address`, and optionally `hospitalId`.',
      security: adminSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdminCreateUserRequest' },
            examples: {
              patient: {
                summary: 'Create a PATIENT account',
                value: {
                  role: 'PATIENT',
                  firstName: 'Amaka',
                  lastName: 'Okafor',
                  phone: '+2348012345678',
                  email: 'amaka@example.com',
                  gender: 'FEMALE',
                  preferredLanguage: 'ENGLISH',
                },
              },
              doctor: {
                summary: 'Create a DOCTOR account',
                value: {
                  role: 'DOCTOR',
                  firstName: 'Emeka',
                  lastName: 'Nwosu',
                  phone: '+2347098765432',
                  email: 'emeka@mediorg.ng',
                  licenseNumber: 'MDC/2019/12345',
                  specialtyId: '6650a1b2c3d4e5f6a7b8c9d5',
                  hospitalId: '6650a1b2c3d4e5f6a7b8c9d4',
                  yearsExperience: 8,
                  bio: 'Cardiologist with 8 years of post-residency experience.',
                },
              },
              pmv: {
                summary: 'Create a PMV account',
                value: {
                  role: 'PMV',
                  firstName: 'Bola',
                  lastName: 'Adeyemi',
                  phone: '+2348133445566',
                  email: 'bola@pharmacy.ng',
                  businessName: 'Adeyemi Pharmacy & Stores',
                  licenseNumber: 'PCN/2021/88421',
                  address: '14 Adeola Odeku St, Victoria Island, Lagos',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'User created.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminCreateUserResponse' },
              examples: {
                withTempPassword: {
                  summary: 'No password supplied — temp password generated',
                  value: {
                    user: {
                      id: '6650a1b2c3d4e5f6a7b8c9d0',
                      role: 'DOCTOR',
                      phone: '+2347098765432',
                      email: 'emeka@mediorg.ng',
                      firstName: 'Emeka',
                      lastName: 'Nwosu',
                      preferredLanguage: 'ENGLISH',
                      isPhoneVerified: true,
                    },
                    temporaryPassword: 'x7kq9mzr',
                  },
                },
                withSuppliedPassword: {
                  summary: 'Password was supplied — no temp password in response',
                  value: {
                    user: {
                      id: '6650a1b2c3d4e5f6a7b8c9d0',
                      role: 'PATIENT',
                      phone: '+2348012345678',
                      email: 'amaka@example.com',
                      firstName: 'Amaka',
                      lastName: 'Okafor',
                      preferredLanguage: 'ENGLISH',
                      isPhoneVerified: true,
                    },
                  },
                },
              },
            },
          },
        },
        '409': {
          description: 'A user with this phone already exists.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'A user with this phone already exists.' },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '403': {
          description: 'Authenticated user is not an ADMIN.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '422': {
          description: 'Validation error.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/admin/users/{id}/status': {
    patch: {
      tags: ['Admin'],
      summary: 'Activate or deactivate a user',
      description:
        `${adminNote}\n\n` +
        'Sets the `isActive` flag on a user account. ' +
        'Deactivated users receive a `403` on login. ' +
        'The updated user document is returned.',
      security: adminSecurity,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'MongoDB ObjectId of the target user.',
          schema: { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d0' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SetUserStatusRequest' },
            examples: {
              deactivate: { summary: 'Deactivate', value: { isActive: false } },
              reactivate: { summary: 'Reactivate', value: { isActive: true } },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated user document.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PublicUser' },
            },
          },
        },
        '404': {
          description: 'User not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'User not found' },
            },
          },
        },
        '401': {
          description: 'Missing or invalid token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '403': {
          description: 'Authenticated user is not an ADMIN.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/admin/appointments': {
    get: {
      tags: ['Admin'],
      summary: 'List all appointments',
      description:
        `${adminNote}\n\n` +
        'Returns up to 500 appointments across all patients and doctors, ' +
        'sorted by `createdAt` descending. Patient and doctor fields are populated ' +
        'with name and phone for display.',
      security: adminSecurity,
      responses: {
        '200': {
          description: 'Array of appointment documents.',
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
        '403': {
          description: 'Authenticated user is not an ADMIN.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },
};