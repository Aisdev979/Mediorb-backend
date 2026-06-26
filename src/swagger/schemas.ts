import { OpenAPIV3 } from 'openapi-types';

export const schemas: Record<string, OpenAPIV3.SchemaObject> = {

  // ── Primitives / enums ─────────────────────────────────────────────────────

  Role: {
    type: 'string',
    enum: ['PATIENT', 'PMV', 'DOCTOR', 'ADMIN'],
    example: 'PATIENT',
  },

  Gender: {
    type: 'string',
    enum: ['MALE', 'FEMALE', 'OTHER'],
  },

  Language: {
    type: 'string',
    enum: ['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN'],
    default: 'ENGLISH',
  },

  AppointmentStatus: {
    type: 'string',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    example: 'PENDING',
  },

  AppointmentChannel: {
    type: 'string',
    enum: ['APP', 'USSD', 'PMV'],
    example: 'APP',
  },

  // ── Core objects ───────────────────────────────────────────────────────────

  PublicUser: {
    type: 'object',
    properties: {
      id:                { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d0' },
      role:              { $ref: '#/components/schemas/Role' },
      phone:             { type: 'string', example: '+2348012345678' },
      email:             { type: 'string', nullable: true, example: 'user@example.com' },
      firstName:         { type: 'string', example: 'Amaka' },
      lastName:          { type: 'string', example: 'Okafor' },
      preferredLanguage: { $ref: '#/components/schemas/Language' },
      isPhoneVerified:   { type: 'boolean', example: true },
    },
    required: ['id', 'role', 'phone', 'firstName', 'lastName', 'preferredLanguage', 'isPhoneVerified'],
  },

  Appointment: {
    type: 'object',
    properties: {
      _id:               { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d1' },
      patient:           { type: 'object', description: 'Populated: { _id, firstName, lastName, phone }' },
      doctor:            { type: 'object', description: 'Populated: { _id, firstName, lastName }',  nullable: true },
      hospital:          { type: 'string', nullable: true },
      department:        { type: 'string', nullable: true },
      specialty:         { type: 'object', nullable: true, description: 'Populated: { _id, name }' },
      channel:           { $ref: '#/components/schemas/AppointmentChannel' },
      status:            { $ref: '#/components/schemas/AppointmentStatus' },
      preferredLanguage: { $ref: '#/components/schemas/Language' },
      scheduledAt:       { type: 'string', format: 'date-time', nullable: true },
      reason:            { type: 'string', nullable: true },
      createdAt:         { type: 'string', format: 'date-time' },
      updatedAt:         { type: 'string', format: 'date-time' },
    },
  },

  // ── Error ──────────────────────────────────────────────────────────────────

  ApiError: {
    type: 'object',
    properties: {
      status:  { type: 'string', example: 'error' },
      message: { type: 'string', example: 'Invalid credentials' },
    },
    required: ['status', 'message'],
  },

  // ── Auth ───────────────────────────────────────────────────────────────────

  RegisterRequest: {
    type: 'object',
    required: ['role', 'phone', 'email', 'password', 'firstName', 'lastName'],
    properties: {
      role:              { $ref: '#/components/schemas/Role' },
      phone:             { type: 'string', example: '+2348012345678' },
      email:             { type: 'string', format: 'email', example: 'amaka@example.com' },
      password:          { type: 'string', minLength: 6, example: 'secret123' },
      firstName:         { type: 'string', example: 'Amaka' },
      lastName:          { type: 'string', example: 'Okafor' },
      gender:            { $ref: '#/components/schemas/Gender' },
      dateOfBirth:       { type: 'string', format: 'date', example: '1995-07-22' },
      preferredLanguage: { $ref: '#/components/schemas/Language' },
    },
  },

  RegisterResponse: {
    type: 'object',
    properties: {
      userId:  { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d0' },
      message: { type: 'string', example: 'Registered. Verify the OTP sent to your phone.' },
      devOtp:  {
        type: 'string',
        description: 'Only present in development (NODE_ENV=development). The raw OTP for testing.',
        example: '482910',
      },
    },
    required: ['userId', 'message'],
  },

  VerifyOtpRequest: {
    type: 'object',
    required: ['phone', 'code'],
    properties: {
      phone: { type: 'string', example: '+2348012345678' },
      code:  { type: 'string', minLength: 6, maxLength: 6, example: '482910' },
    },
  },

  AuthTokensResponse: {
    type: 'object',
    properties: {
      user:         { $ref: '#/components/schemas/PublicUser' },
      accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
    required: ['user', 'accessToken', 'refreshToken'],
  },

  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email:    { type: 'string', format: 'email', example: 'amaka@example.com' },
      password: { type: 'string', example: 'secret123' },
    },
  },

  LoginResponse: {
    description: 'Normal login returns tokens. When 2FA is enabled, returns a challenge instead.',
    oneOf: [
      { $ref: '#/components/schemas/AuthTokensResponse' },
      { $ref: '#/components/schemas/TwoFactorChallengeResponse' },
    ],
  },

  TwoFactorChallengeResponse: {
    type: 'object',
    properties: {
      requires2fa: { type: 'boolean', example: true },
      phone:       { type: 'string', example: '+2348012345678', description: 'Masked phone number the OTP was sent to.' },
      devOtp:      { type: 'string', description: 'Dev only.', example: '193847' },
    },
    required: ['requires2fa', 'phone'],
  },

  RefreshRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  },

  RefreshResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
    required: ['accessToken'],
  },

  ChangePasswordRequest: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: { type: 'string', example: 'oldSecret123' },
      newPassword:     { type: 'string', minLength: 6, example: 'newSecret456' },
    },
  },

  // ── Admin ──────────────────────────────────────────────────────────────────

  StatsResponse: {
    type: 'object',
    properties: {
      users: {
        type: 'object',
        properties: {
          patients: { type: 'integer', example: 142 },
          pmvs:     { type: 'integer', example: 18 },
          doctors:  { type: 'integer', example: 34 },
          admins:   { type: 'integer', example: 3 },
          total:    { type: 'integer', example: 197 },
        },
        required: ['patients', 'pmvs', 'doctors', 'admins', 'total'],
      },
      appointments:  { type: 'integer', example: 523 },
      queue: {
        type: 'object',
        properties: {
          waiting:        { type: 'integer', example: 7 },
          inConsultation: { type: 'integer', example: 2 },
        },
        required: ['waiting', 'inConsultation'],
      },
      consultations: { type: 'integer', example: 310 },
      prescriptions: { type: 'integer', example: 281 },
    },
    required: ['users', 'appointments', 'queue', 'consultations', 'prescriptions'],
  },

  AdminCreateUserRequest: {
    type: 'object',
    required: ['role', 'firstName', 'lastName', 'phone', 'email'],
    properties: {
      role:              { $ref: '#/components/schemas/Role' },
      firstName:         { type: 'string', example: 'Emeka' },
      lastName:          { type: 'string', example: 'Nwosu' },
      phone:             { type: 'string', example: '+2347098765432' },
      email:             { type: 'string', format: 'email', example: 'emeka@mediorg.ng' },
      password:          { type: 'string', minLength: 6, description: 'If omitted, a temporary password is auto-generated and returned.' },
      gender:            { $ref: '#/components/schemas/Gender' },
      preferredLanguage: { $ref: '#/components/schemas/Language' },
      licenseNumber:     { type: 'string', description: 'Required for DOCTOR and PMV roles.' },
      businessName:      { type: 'string', description: 'PMV only.' },
      address:           { type: 'string', description: 'PMV only.' },
      specialtyId:       { type: 'string', description: 'DOCTOR only — MongoDB ObjectId of specialty.' },
      hospitalId:        { type: 'string', description: 'DOCTOR / PMV — MongoDB ObjectId of hospital.' },
      bio:               { type: 'string', description: 'DOCTOR only.' },
      yearsExperience:   { type: 'integer', description: 'DOCTOR only.' },
    },
  },

  AdminCreateUserResponse: {
    type: 'object',
    properties: {
      user:              { $ref: '#/components/schemas/PublicUser' },
      temporaryPassword: {
        type: 'string',
        nullable: true,
        description: 'Present only when no password was supplied in the request. Hand this to the new user.',
        example: 'x7kq9mzr',
      },
    },
    required: ['user'],
  },

  SetUserStatusRequest: {
    type: 'object',
    required: ['isActive'],
    properties: {
      isActive: { type: 'boolean', example: false, description: 'true to reactivate, false to deactivate.' },
    },
  },

  // ── Appointments ───────────────────────────────────────────────────────────

  CreateAppointmentRequest: {
    type: 'object',
    properties: {
      patientId:         { type: 'string', description: 'PMV only — book on behalf of a walk-in patient.' },
      doctorId:          { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d3' },
      hospitalId:        { type: 'string', example: '6650a1b2c3d4e5f6a7b8c9d4' },
      departmentId:      { type: 'string' },
      specialtyId:       { type: 'string' },
      channel:           { $ref: '#/components/schemas/AppointmentChannel' },
      preferredLanguage: { $ref: '#/components/schemas/Language' },
      scheduledAt:       { type: 'string', format: 'date-time', example: '2025-09-01T09:00:00.000Z' },
      reason:            { type: 'string', example: 'Persistent headache for two weeks.' },
    },
  },

  UpdateAppointmentStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { $ref: '#/components/schemas/AppointmentStatus' },
    },
  },
};