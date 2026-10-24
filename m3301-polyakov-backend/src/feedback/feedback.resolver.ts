import {
  Args,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { FeedbackService } from './feedback.service';
import { FeedbackType } from './graphql/feedback.type';
import { PaginatedFeedback } from './graphql/paginated-feedback.type';
import { CreateFeedbackInput } from './graphql/create-feedback.input';
import { UpdateFeedbackInput } from './graphql/update-feedback.input';
import { totalPages } from '../common/pagination/paginate';
import type { FeedbackEntity } from '../database/entities/feedback.entity';

function toGql(entity: FeedbackEntity): FeedbackType {
  return entity as unknown as FeedbackType;
}

@Resolver(() => FeedbackType)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Query(() => [FeedbackType], {
    name: 'feedbacks',
    description: 'Получить все отзывы (отсортированы по дате, новые первыми)',
    complexity: 5,
  })
  findAll(): FeedbackType[] {
    return this.feedbackService.findAll().map(toGql);
  }

  @Query(() => PaginatedFeedback, {
    name: 'feedbacksPaginated',
    description: 'Получить отзывы с пагинацией',
    complexity: ({ args, childComplexity }) =>
      childComplexity * (args['limit'] ?? 10) + 1,
  })
  findAllPaginated(
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Номер страницы (начиная с 1)',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 10,
      description: 'Количество элементов на странице',
    })
    limit: number,
  ): PaginatedFeedback {
    const result = this.feedbackService.findAllPaginated(page, limit);
    return {
      data: result.data.map(toGql),
      total: result.total,
      page,
      limit,
      totalPages: totalPages(result.total, limit),
    };
  }

  @Query(() => FeedbackType, {
    name: 'feedback',
    description: 'Получить отзыв по идентификатору',
    complexity: 2,
  })
  findOne(
    @Args('id', { type: () => ID, description: 'Идентификатор отзыва' })
    id: string,
  ): FeedbackType {
    return toGql(this.feedbackService.findOne(id));
  }

  @Mutation(() => FeedbackType, {
    description: 'Оставить новый отзыв о ресторане',
    complexity: 3,
  })
  async submitFeedback(
    @Args('input', { description: 'Данные нового отзыва' })
    input: CreateFeedbackInput,
  ): Promise<FeedbackType> {
    const entity = await this.feedbackService.create({
      authorName: input.authorName,
      email: input.email,
      rating: input.rating,
      message: input.message,
      ownerUsername: null,
    });
    return toGql(entity);
  }

  @Mutation(() => FeedbackType, {
    description: 'Обновить отзыв (частичное обновление)',
    complexity: 3,
  })
  async updateFeedback(
    @Args('id', { type: () => ID, description: 'Идентификатор отзыва' })
    id: string,
    @Args('input', { description: 'Обновляемые поля отзыва' })
    input: UpdateFeedbackInput,
  ): Promise<FeedbackType> {
    const entity = await this.feedbackService.patch(id, {
      authorName: input.authorName,
      email: input.email,
      rating: input.rating,
      message: input.message,
    });
    return toGql(entity);
  }

  @Mutation(() => Boolean, {
    description: 'Удалить отзыв по идентификатору',
    complexity: 2,
  })
  async removeFeedback(
    @Args('id', { type: () => ID, description: 'Идентификатор отзыва' })
    id: string,
  ): Promise<boolean> {
    await this.feedbackService.remove(id);
    return true;
  }
}
