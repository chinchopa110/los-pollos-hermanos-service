export interface FeedbackEntity {
  id: string;
  authorName: string;
  email: string;
  rating: number;
  message: string;
  ownerUsername: string | null;
  createdAt: Date;
}
