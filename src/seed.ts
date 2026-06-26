import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';
import { User, Specialty, Hospital, Department } from './models';
import { hashPassword } from './utils/password';

async function run(): Promise<void> {
  await connectDB(env.mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Specialty.deleteMany({}),
    Hospital.deleteMany({}),
    Department.deleteMany({}),
  ]);

  const specialtyNames = [
    'General Practice',
    'Pediatrics',
    'Gynecology',
    'Cardiology',
    'Dermatology',
    'Dentistry',
    'Mental Health',
    'Respiratory Care',
  ];
  const specialties = await Specialty.insertMany(specialtyNames.map((name) => ({ name })));
  const gp = specialties.find((s) => s.name === 'General Practice');

  const hospital = await Hospital.create({
    name: 'MediOrb Demo Clinic',
    address: 'Ikeja, Lagos',
    phone: '+2348000000000',
  });

  await Department.insertMany(
    ['General Outpatient', 'Pharmacy', 'Maternity'].map((name) => ({
      hospital: hospital._id,
      name,
    })),
  );

  const passwordHash = await hashPassword('Password123');

  await User.create([
    {
      role: 'ADMIN',
      phone: '+2348100000001',
      email: 'admin@mediorb.test',
      passwordHash,
      firstName: 'Ada',
      lastName: 'Admin',
      isPhoneVerified: true,
    },
    {
      role: 'PATIENT',
      phone: '+2348100000002',
      email: 'amina@mediorb.test',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Bello',
      isPhoneVerified: true,
      preferredLanguage: 'HAUSA',
      patientProfile: {
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        emergencyContacts: [
          { name: 'Sani Bello', relationship: 'Brother', phone: '+2348100000099' },
        ],
      },
    },
    {
      role: 'PMV',
      phone: '+2348100000003',
      email: 'pmv@mediorb.test',
      passwordHash,
      firstName: 'Chidi',
      lastName: 'Okeke',
      isPhoneVerified: true,
      pmvProfile: {
        businessName: 'Okeke Chemist',
        licenseNumber: 'PMV-24567',
        address: 'Surulere, Lagos',
        hospital: hospital._id,
        verificationStatus: 'APPROVED',
      },
    },
    {
      role: 'DOCTOR',
      phone: '+2348100000004',
      email: 'doctor@mediorb.test',
      passwordHash,
      firstName: 'Ngozi',
      lastName: 'Eze',
      isPhoneVerified: true,
      doctorProfile: {
        specialty: gp?._id,
        hospital: hospital._id,
        licenseNumber: 'MDCN-12345',
        bio: 'General practitioner',
        yearsExperience: 8,
        consultationLanguages: ['ENGLISH', 'IGBO'],
        verificationStatus: 'APPROVED',
        availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
      },
    },
  ]);

  console.log('Seed complete.');
  console.log('Login with any seeded phone and password "Password123".');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
