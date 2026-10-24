import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { MenuCategory } from './menu-category.enum';

@ObjectType({ description: 'Позиция меню ресторана' })
export class MenuItem {
  @Field(() => ID, { description: 'Уникальный идентификатор позиции меню' })
  id: string;

  @Field(() => String, { description: 'Название позиции меню' })
  name: string;

  @Field(() => String, { description: 'Описание позиции меню' })
  description: string;

  @Field(() => Float, { description: 'Цена в рублях' })
  priceRub: number;

  @Field(() => MenuCategory, { description: 'Категория позиции меню' })
  category: MenuCategory;

  @Field(() => String, { nullable: true, description: 'Ключ изображения (имя файла)' })
  imageKey: string | null;

  @Field(() => String, { nullable: true, description: 'Публичный URL изображения в Object Storage' })
  imageUrl: string | null;

  @Field(() => Boolean, { description: 'Доступна ли позиция для заказа' })
  isAvailable: boolean;

  @Field(() => Date, { description: 'Дата и время создания записи' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата и время последнего обновления записи' })
  updatedAt: Date;
}
