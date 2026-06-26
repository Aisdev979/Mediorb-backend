import { Schema, model, Types } from 'mongoose';

export type Role = 'PATIENT' | 'PMV' | 'DOCTOR' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Language = 'ENGLISH' | 'HAUSA' | 'YORUBA' | 'IGBO' | 'PIDGIN';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

const emergencyContactSchema = new Schema(
  { name: String, relationship: String, phone: String },
  { _id: false },
);

const availabilitySchema = new Schema(
  { dayOfWeek: Number, startTime: String, endTime: String },
  { _id: false },
);

const userSchema = new Schema(
  {
    role: { type: String, enum: ['PATIENT', 'PMV', 'DOCTOR', 'ADMIN'], required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    dateOfBirth: Date,
    preferredLanguage: {
      type: String,
      enum: ['ENGLISH', 'HAUSA', 'YORUBA', 'IGBO', 'PIDGIN'],
      default: 'ENGLISH',
    },
    avatarUrl: String,
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    pushTokens: { type: [String], default: [] },
    notificationPrefs: {
      type: new Schema(
        {
          appointments: { type: Boolean, default: true },
          queue: { type: Boolean, default: true },
          prescriptions: { type: Boolean, default: true },
          general: { type: Boolean, default: true },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    // Patient
    patientProfile: {
      type: new Schema(
        {
          bloodGroup: String,
          genotype: String,
          allergies: [String],
          chronicConditions: [String],
          emergencyContacts: [emergencyContactSchema],
          address: String,
        },
        { _id: false },
      ),
      default: undefined,
    },

    // PMV / Chemist node
    pmvProfile: {
      type: new Schema(
        {
          businessName: String,
          licenseNumber: String,
          address: String,
          state: String,
          lga: String,
          city: String,
          practiceType: String,
          shopImageUrl: String,
          availability: [availabilitySchema],
          hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
          verificationStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
          },
        },
        { _id: false },
      ),
      default: undefined,
    },

    // Doctor
    doctorProfile: {
      type: new Schema(
        {
          specialty: { type: Schema.Types.ObjectId, ref: 'Specialty' },
          hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
          licenseNumber: String,
          bio: String,
          yearsExperience: Number,
          consultationLanguages: [String],
          verificationStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
          },
          availability: [availabilitySchema],
        },
        { _id: false },
      ),
      default: undefined,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export const User = model('User', userSchema);
export type UserId = Types.ObjectId;
