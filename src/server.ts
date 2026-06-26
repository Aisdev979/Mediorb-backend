import type { IncomingMessage, ServerResponse } from 'http';
import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';

// ── Single app instance, shared across all invocations ─────────────────────
const app = createApp();

// ── DB connection cache (serverless-safe) ──────────────────────────────────
let dbReady: Promise<void> | null = null;

function ensureDB(): Promise<void> {
  if (!dbReady) {
    dbReady = connectDB(env.mongoUri).catch((err) => {
      dbReady = null; // allow retry on next request if this one failed
      throw err;
    });
  }
  return dbReady;
}

// ── DEVELOPMENT — HTTP server + Socket.IO ──────────────────────────────────
if (env.isDev) {
  (async () => {
    try {
      await ensureDB();
      const { createServer } = await import('http');
      const { initSocket }   = await import('./realtime/socket');
      const httpServer = createServer(app);
      initSocket(httpServer);
      httpServer.listen(env.port, () => {
        console.log(`MediOrb API running on http://localhost:${env.port}/api`);
      });
    } catch (err) {
      console.error('Failed to start server', err);
      process.exit(1);
    }
  })();
}

// ── PRODUCTION — Vercel serverless handler ─────────────────────────────────
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await ensureDB();
  app(req as any, res as any);
}