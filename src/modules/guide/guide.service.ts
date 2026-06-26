import { FastingGuide } from '../../models/fastingGuide.model';
import { ApiError } from '../../utils/apiError';
import { CreateGuideInput } from './guide.validation';

export async function listGuides(filters: {
  condition?: string;
  period?: string;
  language?: string;
}) {
  const query: Record<string, unknown> = {};
  if (filters.condition) query.condition = filters.condition;
  if (filters.period) query.period = filters.period;
  if (filters.language) query.language = filters.language;
  return FastingGuide.find(query).sort({ createdAt: -1 });
}

export async function getGuide(id: string) {
  const guide = await FastingGuide.findById(id);
  if (!guide) throw new ApiError(404, 'Guide not found');
  return guide;
}

export async function createGuide(input: CreateGuideInput) {
  return FastingGuide.create(input);
}

export async function updateGuide(id: string, input: Record<string, unknown>) {
  const guide = await FastingGuide.findByIdAndUpdate(id, { $set: input }, { new: true });
  if (!guide) throw new ApiError(404, 'Guide not found');
  return guide;
}

export async function deleteGuide(id: string) {
  const guide = await FastingGuide.findByIdAndDelete(id);
  if (!guide) throw new ApiError(404, 'Guide not found');
  return { message: 'Guide deleted' };
}
