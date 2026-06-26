import { OpenAPIV3 } from 'openapi-types';

export const authPaths: OpenAPIV3.PathsObject = {

  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description:
        'Creates a new user account and immediately issues a 6-digit OTP to the ' +
        'provided phone number (via SMS) and email. The account is not usable until ' +
        'the OTP is verified via `POST /auth/verify-otp`.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Registration successful. OTP dispatched.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterResponse' },
              examples: {
                success: {
                  summary: 'Standard response',
                  value: {
                    userId: '6650a1b2c3d4e5f6a7b8c9d0',
                    message: 'Registered. Verify the OTP sent to your phone.',
                  },
                },
                devMode: {
                  summary: 'Development mode (NODE_ENV=development)',
                  value: {
                    userId: '6650a1b2c3d4e5f6a7b8c9d0',
                    message: 'Registered. Verify the OTP sent to your phone.',
                    devOtp: '482910',
                  },
                },
              },
            },
          },
        },
        '409': {
          description: 'Phone number or email already registered.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                phoneTaken: { value: { status: 'error', message: 'Phone number already registered' } },
                emailTaken: { value: { status: 'error', message: 'Email already registered' } },
              },
            },
          },
        },
        '422': {
          description: 'Validation error — check the request body.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/auth/verify-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Verify phone OTP',
      description:
        'Consumes the most recent unused OTP for the given phone number. On success, ' +
        'marks the phone as verified and returns the user object plus a JWT access/refresh ' +
        'token pair. Also used as the second factor after a 2FA login challenge.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'OTP accepted. Tokens issued.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthTokensResponse' },
              example: {
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
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
        '400': {
          description: 'No pending OTP, OTP expired, or code is incorrect.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                noPending: { value: { status: 'error', message: 'No pending OTP for this phone' } },
                expired:   { value: { status: 'error', message: 'OTP expired' } },
                wrong:     { value: { status: 'error', message: 'Incorrect OTP' } },
              },
            },
          },
        },
        '404': {
          description: 'User not found for the given phone.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      description:
        'Authenticates a user by email + password. ' +
        'If the account has two-factor authentication enabled, tokens are **not** returned — ' +
        'instead a challenge object is returned and an OTP is sent to the user\'s phone. ' +
        'The client must then call `POST /auth/verify-otp` to complete sign-in.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginResponse' },
              examples: {
                standard: {
                  summary: 'Normal login — tokens returned',
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
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
                twoFactor: {
                  summary: '2FA challenge — OTP sent to phone',
                  value: {
                    requires2fa: true,
                    phone: '+2348012345678',
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Email not found or password incorrect.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'Invalid credentials' },
            },
          },
        },
        '403': {
          description: 'Account has been deactivated by an admin.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'This account has been deactivated.' },
            },
          },
        },
      },
    },
  },

  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description:
        'Exchanges a valid refresh token for a new access token. ' +
        'The refresh token itself is not rotated — issue a new pair by logging in again if needed.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'New access token issued.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshResponse' },
              example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          },
        },
        '401': {
          description: 'Refresh token is missing, malformed, or expired.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'Invalid refresh token' },
            },
          },
        },
      },
    },
  },

  '/auth/change-password': {
    post: {
      tags: ['Auth'],
      summary: 'Change own password',
      description:
        'Allows an authenticated user to change their own password. ' +
        'Requires the current password to be provided for re-verification.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password updated successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Password updated' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Current password is wrong.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: { status: 'error', message: 'Current password is incorrect' },
            },
          },
        },
        '401': {
          description: 'Missing or invalid access token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        '404': {
          description: 'Authenticated user record not found.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
  },
};