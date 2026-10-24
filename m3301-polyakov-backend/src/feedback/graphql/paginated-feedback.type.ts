import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FeedbackType } from './feedback.type';

@ObjectType({ description: 'Страница списка отзывов с метаданными пагинации' })
export class PaginatedFeedback {
  @Field(() => [FeedbackType], { description: 'Список отзывов на текущей странице' })
  data: FeedbackType[];

  @Field(() => Int, { description: 'Общее количество отзывов' })
  total: number;

  @Field(() => Int, { description: 'Номер текущей страницы' })
  page: number;

  @Field(() => Int, { description: 'Количество элементов на странице' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}
