import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationQueryDto,
  resolvedPageLimit,
} from '../common/dto/pagination-query.dto';
import { setPaginationLinkHeader } from '../common/pagination/link-header';
import { totalPages } from '../common/pagination/paginate';
import { toViewUser } from '../view-user';
import { canManageFeedback } from './feedback-access';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PatchFeedbackDto } from './dto/patch-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { PaginatedFeedbackDto } from './dto/paginated-feedback.dto';
import { RestApiTags } from '../common/swagger/rest-api-tags';
import { FeedbackService } from './feedback.service';
import {
  AuditLog,
  AuditLogInterceptor,
} from '../common/interceptors/audit-log.interceptor';

type AppSession = NonNullable<Request['session']>;

function sessionSlice(sess: AppSession) {
  return {
    user: sess.user,
    feedbackOwnedIds: sess.feedbackOwnedIds,
  };
}

@ApiTags(RestApiTags.feedback)
@Controller('api/feedback')
@UseInterceptors(AuditLogInterceptor)
export class FeedbackApiController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @ApiOperation({ summary: 'Список отзывов (постранично)' })
  @ApiOkResponse({ type: PaginatedFeedbackDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  list(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginationQueryDto,
  ): PaginatedFeedbackDto {
    const { page, limit } = resolvedPageLimit(query);
    const { data, total } = this.feedbackService.findAllPaginated(page, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: totalPages(total, limit),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один отзыв по идентификатору' })
  @ApiOkResponse({ type: FeedbackResponseDto })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  getOne(@Param('id') id: string): FeedbackResponseDto {
    return this.feedbackService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiCreatedResponse({ type: FeedbackResponseDto })
  @ApiBadRequestResponse({ description: 'Ошибка валидации тела запроса' })
  @AuditLog({
    actionType: 'CREATE',
    entityType: 'feedback',
    getEntityId: (data) => data?.id || null,
    getMetadata: (data) => ({ rating: data?.rating, authorName: data?.authorName }),
  })
  async create(
    @Req() req: Request,
    @Body() dto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const session = req.session as AppSession;
    const viewUser = toViewUser(session.user ?? null);
    const row = await this.feedbackService.create({
      authorName: dto.authorName,
      email: dto.email,
      rating: dto.rating,
      message: dto.message,
      ownerUsername: viewUser?.username ?? null,
    });
    if (!viewUser) {
      const ids = session.feedbackOwnedIds ?? [];
      ids.push(row.id);
      session.feedbackOwnedIds = ids;
    }
    return row;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить отзыв' })
  @ApiOkResponse({ type: FeedbackResponseDto })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  @ApiForbiddenResponse({ description: 'Нет прав на изменение этого отзыва' })
  @AuditLog({
    actionType: 'UPDATE',
    entityType: 'feedback',
    getEntityId: (data) => data?.id || null,
    getMetadata: (data) => ({ rating: data?.rating }),
  })
  async patch(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: PatchFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const session = req.session as AppSession;
    const existing = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), existing, user)) {
      throw new ForbiddenException('Недостаточно прав для изменения отзыва');
    }
    return this.feedbackService.patch(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiNoContentResponse({ description: 'Удалено' })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  @ApiForbiddenResponse({ description: 'Нет прав на удаление этого отзыва' })
  @AuditLog({
    actionType: 'DELETE',
    entityType: 'feedback',
  })
  async remove(@Req() req: Request, @Param('id') id: string): Promise<void> {
    const session = req.session as AppSession;
    const existing = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), existing, user)) {
      throw new ForbiddenException('Недостаточно прав для удаления отзыва');
    }
    await this.feedbackService.remove(id);
  }
}
