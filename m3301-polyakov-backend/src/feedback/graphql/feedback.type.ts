import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Отзыв посетителя ресторана' })
export class FeedbackType {
  @Field(() => ID, { description: 'Уникальный идентификатор отзыва' })
  id: string;

  @Field(() => String, { description: 'Имя автора отзыва' })
  authorName: string;

  @Field(() => String, { description: 'Email автора отзыва' })
  email: string;

  @Field(() => Int, { description: 'Оценка от 1 до 5' })
  rating: number;

  @Field(() => String, { description: 'Текст отзыва' })
  message: string;

  @Field(() => String, { nullable: true, description: 'Логин владельца отзыва (если авторизован)' })
  ownerUsername: string | null;

  @Field(() => Date, { description: 'Дата и время создания отзыва' })
  createdAt: Date;
}
