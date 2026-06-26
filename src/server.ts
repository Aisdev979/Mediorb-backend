import { createServer } from 'http';
import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';
import { initSocket } from './realtime/socket';

async function start(): Promise<void> {
  await connectDB(env.mongoUri);
  const app = createApp();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`MediOrb API running on http://localhost:${env.port}/api`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
