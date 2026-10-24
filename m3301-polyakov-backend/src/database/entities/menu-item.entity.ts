export interface MenuItemEntity {
  id: string;
  name: string;
  description: string;
  priceRub: number;
  category: 'combo' | 'chicken' | 'sides' | 'drinks';
  imageKey: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
