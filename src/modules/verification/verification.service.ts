import { VerificationDocument } from '../../models/verificationDocument.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { SubmitDocumentInput } from './verification.validation';
import { createNotification } from '../notifications/notifications.service';

export async function submitDocument(ownerId: string, input: SubmitDocumentInput) {
  return VerificationDocument.create({ owner: ownerId, type: input.type, fileUrl: input.fileUrl });
}

export async function listDocuments(status?: string) {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  return VerificationDocument.find(query)
    .populate('owner', 'firstName lastName role')
    .sort({ createdAt: -1 });
}

export async function listOwnDocuments(ownerId: string) {
  return VerificationDocument.find({ owner: ownerId }).sort({ createdAt: -1 });
}

export async function reviewDocument(
  id: string,
  reviewerId: string,
  status: 'APPROVED' | 'REJECTED',
) {
  const doc = await VerificationDocument.findById(id);
  if (!doc) throw new ApiError(404, 'Document not found');
  doc.status = status;
  doc.reviewer = reviewerId as any;
  doc.reviewedAt = new Date();
  await doc.save();

  // Reflect the decision on the provider's profile.
  const owner = await User.findById(doc.owner);
  if (owner) {
    if (owner.role === 'DOCTOR' && owner.doctorProfile) {
      (owner.doctorProfile as any).verificationStatus = status;
      owner.markModified('doctorProfile');
    } else if (owner.role === 'PMV' && owner.pmvProfile) {
      (owner.pmvProfile as any).verificationStatus = status;
      owner.markModified('pmvProfile');
    }
    await owner.save();
  }

  try {
    await createNotification(
      String(doc.owner),
      'VERIFICATION',
      'Verification update',
      status === 'APPROVED'
        ? 'Your documents were approved. You are now verified.'
        : 'Your documents were not approved. Please review and resubmit.',
    );
  } catch {
    // best-effort
  }
  return doc;
}
