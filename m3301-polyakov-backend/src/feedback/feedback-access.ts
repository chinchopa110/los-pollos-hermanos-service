import type { FeedbackEntity } from '../database/entities/feedback.entity';
import type { ViewUser } from '../view-user';

export type FeedbackSessionSlice = {
  user?: { name: string; username: string };
  feedbackOwnedIds?: string[];
};

export function canManageFeedback(
  session: FeedbackSessionSlice,
  item: FeedbackEntity,
  viewUser: ViewUser | null,
): boolean {
  if (viewUser?.isAdmin) {
    return true;
  }
  if (item.ownerUsername != null && item.ownerUsername !== '') {
    return viewUser?.username === item.ownerUsername;
  }
  const ids = session.feedbackOwnedIds ?? [];
  return ids.includes(item.id);
}
