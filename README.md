# MediOrb Backend

Node + Express + Mongoose + TypeScript. MongoDB Atlas (free), Railway for the single service, Socket.IO in memory. The PRD is the source of truth, so the moat features are first-class.

## Run it locally (fresh)

```
npm install
copy .env.example .env
```

Put your MongoDB Atlas connection string in MONGODB_URI and set the two JWT secrets, then:

```
npm run seed
npm run dev
```

You should see "MongoDB connected" and "MediOrb API running on http://localhost:4000/api".

Seed accounts, password Password123:
- Admin +2348100000001
- Patient (Amina, Hausa) +2348100000002
- PMV (Okeke Chemist) +2348100000003
- Doctor (Dr Eze) +2348100000004

## API surface (all live)

Auth: POST /api/auth/register, /login, /verify-otp, /refresh

Users (Bearer): GET /api/users/me, PATCH /api/users/me, PATCH /api/users/me/profile

Catalog (public): GET /api/catalog/specialties, /hospitals, /hospitals/:id/departments

PMV (PMV/ADMIN): POST /api/pmv/patients register walk-in, GET /api/pmv/patients?phone= lookup

Appointments (Bearer): POST /api/appointments, GET /api/appointments, GET /api/appointments/:id, PATCH /api/appointments/:id/status

Queue (Bearer, live): POST /api/queue/join (PMV may pass patientId), GET /api/queue?departmentId=&status=, GET /api/queue/:id, PATCH /api/queue/:id/status

Consultations (Bearer): POST /api/consultations (DOCTOR/PMV/ADMIN), GET /api/consultations, GET /api/consultations/:id, PATCH /api/consultations/:id (DOCTOR/ADMIN), POST /api/consultations/:id/messages

Prescriptions (Bearer): POST /api/prescriptions (DOCTOR/ADMIN), GET /api/prescriptions?patientId=, GET /api/prescriptions/:id

Records (Bearer): POST /api/records (DOCTOR/PMV/ADMIN), GET /api/records/:patientId

Health card: POST /api/health-card/:patientId/issue (DOCTOR/PMV/ADMIN), GET /api/health-card/:patientId (Bearer), POST /api/health-card/verify (public)

Notifications (Bearer): GET /api/notifications, PATCH /api/notifications/:id/read

## Realtime (Socket.IO)

- Queue: emit queue:subscribe with queue:<departmentId> (or queue:all), receive queue:update.
- Consultation chat: emit consultation:subscribe with the consultation id, receive consultation:message.

## Health card

The server signs the card payload (blood group, allergies, emergency contacts) with an Ed25519 private key. The patient carries payload plus signature, for example in a QR code. A responder verifies it offline with the public key via POST /api/health-card/verify. It is a signature, not a hash, so the data stays readable. Set HEALTHCARD_PRIVATE_KEY and HEALTHCARD_PUBLIC_KEY in .env to keep the same keys across restarts; if unset, a keypair is generated per run.

## Structure

src/config (env, db), src/models (all 17), src/middleware (auth, validate, error), src/utils (password, otp, jwt, signing, apiError, asyncHandler), src/realtime (Socket.IO), src/modules (auth, users, catalog, pmv, appointments, queue, consultations, prescriptions, records, healthcard, notifications), plus app.ts, server.ts, seed.ts.

## Still to build

ussd (Africa's Talking sandbox), reminders (demo trigger), guide (fasting + multilingual content), admin (dashboards), verification (document approval).

## Deploy (free)

Push to GitHub, create a Railway project from the repo, set the env vars, point MONGODB_URI at the same Atlas database. The single service stays in Railway's free zone. Add the $5 Hobby plan before demo day.
