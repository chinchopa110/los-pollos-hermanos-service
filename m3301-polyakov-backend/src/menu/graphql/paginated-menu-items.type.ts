import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MenuItem } from './menu-item.type';

@ObjectType({ description: 'Страница списка позиций меню с метаданными пагинации' })
export class PaginatedMenuItems {
  @Field(() => [MenuItem], { description: 'Список позиций меню на текущей странице' })
  data: MenuItem[];

  @Field(() => Int, { description: 'Общее количество позиций меню' })
  total: number;

  @Field(() => Int, { description: 'Номер текущей страницы' })
  page: number;

  @Field(() => Int, { description: 'Количество элементов на странице' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}
