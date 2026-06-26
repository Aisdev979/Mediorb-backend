import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, { cors: { origin: true } });
  io.on('connection', (socket) => {
    socket.on('queue:subscribe', (room: string) => socket.join(room));
    socket.on('queue:unsubscribe', (room: string) => socket.leave(room));
    socket.on('consultation:subscribe', (id: string) => socket.join(`consultation:${id}`));
    socket.on('consultation:unsubscribe', (id: string) => socket.leave(`consultation:${id}`));
  });
  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
}
