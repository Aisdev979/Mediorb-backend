import { QueueEntry, QueueStatus } from '../../models/queueEntry.model';
import { ApiError } from '../../utils/apiError';
import { getIO } from '../../realtime/socket';
import { JoinQueueInput } from './queue.validation';

function emitQueueUpdate(departmentId: string | undefined, payload: unknown): void {
  const room = `queue:${departmentId ?? 'all'}`;
  try {
    getIO().to(room).emit('queue:update', payload);
  } catch {
    // socket not initialised (e.g. during seed); ignore
  }
}

export async function joinQueue(patientId: string, input: JoinQueueInput) {
  const filter: Record<string, unknown> = { status: 'WAITING' };
  if (input.departmentId) filter.department = input.departmentId;
  const waiting = await QueueEntry.countDocuments(filter);
  const position = waiting + 1;
  const queueNumber = 'Q' + String(position).padStart(3, '0');

  const entry = await QueueEntry.create({
    appointment: input.appointmentId,
    patient: patientId,
    hospital: input.hospitalId,
    department: input.departmentId,
    queueNumber,
    position,
    status: 'WAITING',
    estimatedWaitMinutes: position * 10,
  });

  emitQueueUpdate(input.departmentId, entry);
  return entry;
}

export async function listQueue(departmentId?: string, status?: QueueStatus) {
  const filter: Record<string, unknown> = {};
  if (departmentId) filter.department = departmentId;
  if (status) filter.status = status;
  return QueueEntry.find(filter).sort({ position: 1 }).populate('patient', 'firstName lastName phone');
}

export async function getQueueEntry(id: string) {
  const entry = await QueueEntry.findById(id).populate('patient', 'firstName lastName phone');
  if (!entry) throw new ApiError(404, 'Queue entry not found');
  return entry;
}

export async function updateQueueStatus(id: string, status: QueueStatus) {
  const entry = await QueueEntry.findById(id);
  if (!entry) throw new ApiError(404, 'Queue entry not found');
  entry.status = status;
  await entry.save();
  emitQueueUpdate(entry.department ? String(entry.department) : undefined, entry);
  return entry;
}
