import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';
import { FastingGuide } from './models/fastingGuide.model';

const guides = [
  {
    title: 'Fasting safely with diabetes during Ramadan',
    condition: 'DIABETES',
    period: 'RAMADAN',
    language: 'ENGLISH',
    body: 'If you have diabetes and choose to fast, check your blood sugar before dawn and at dusk. Break your fast immediately if you feel dizzy, shaky, or unwell. Eat suhoor late and choose slow-release foods.',
  },
  {
    title: 'Ciwon suga da azumi',
    condition: 'DIABETES',
    period: 'RAMADAN',
    language: 'HAUSA',
    body: 'Idan kana da ciwon suga kuma kana son yin azumi, duba sukarin jininka kafin alfijir da kuma da yamma. Ka karya azumi nan take idan ka ji jiri ko rashin lafiya.',
  },
  {
    title: 'Managing high blood pressure while fasting',
    condition: 'HYPERTENSION',
    period: 'RAMADAN',
    language: 'ENGLISH',
    body: 'Keep taking your blood pressure medicine, but ask your doctor about shifting the timing to suhoor and iftar. Cut back on salty foods when breaking your fast and stay hydrated overnight.',
  },
  {
    title: 'Fasting during Lent with a chronic condition',
    condition: 'GENERAL',
    period: 'LENT',
    language: 'ENGLISH',
    body: 'If you observe Lenten fasting and manage a chronic condition, plan balanced meals around your fast, keep taking prescribed medicine, and speak to your provider before any major change.',
  },
];

async function run(): Promise<void> {
  await connectDB(env.mongoUri);
  for (const g of guides) {
    await FastingGuide.findOneAndUpdate({ title: g.title }, g, { upsert: true });
  }
  console.log(`Seeded ${guides.length} health guides (non-destructive, your other data is untouched).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
