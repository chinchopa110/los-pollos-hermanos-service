import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Redirect,
  Render,
  Res,
  Session,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { toViewUser } from '../view-user';
import {
  canManageFeedback,
  type FeedbackSessionSlice,
} from './feedback-access';

type AppSession = NonNullable<Request['session']>;

function sessionSlice(sess: AppSession): FeedbackSessionSlice {
  return {
    user: sess.user,
    feedbackOwnedIds: sess.feedbackOwnedIds,
  };
}

@ApiExcludeController()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @Render('feedback/index')
  list(@Session() session: AppSession) {
    const user = toViewUser(session.user ?? null);
    const slice = sessionSlice(session);
    const items = this.feedbackService.findAll().map((item) => ({
      ...item,
      canManage: canManageFeedback(slice, item, user),
    }));
    return {
      title: 'Отзывы',
      user,
      items,
    };
  }

  @Get('add')
  @Render('feedback/form')
  addForm(@Session() session: AppSession) {
    return {
      title: 'Новый отзыв',
      user: toViewUser(session.user ?? null),
      isEdit: false,
      item: null,
      ratingOptions: this.feedbackService.ratingOptions(),
    };
  }

  @Get(':id/edit')
  editForm(
    @Session() session: AppSession,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const item = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), item, user)) {
      return res.redirect(302, '/feedback');
    }
    return res.render('feedback/form', {
      title: 'Редактирование отзыва',
      user,
      isEdit: true,
      item,
      ratingOptions: this.feedbackService.ratingOptions(item.rating),
    });
  }

  @Get(':id')
  @Render('feedback/show')
  show(@Session() session: AppSession, @Param('id') id: string) {
    const item = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    return {
      title: `Отзыв от ${item.authorName}`,
      user,
      item,
      canManage: canManageFeedback(sessionSlice(session), item, user),
    };
  }

  @Post()
  @Redirect()
  async create(
    @Session() session: AppSession,
    @Body()
    body: {
      authorName: string;
      email: string;
      rating: string;
      message: string;
    },
  ) {
    const viewUser = toViewUser(session.user ?? null);
    const ownerUsername = viewUser?.username ?? null;
    const row = await this.feedbackService.create({
      authorName: String(body.authorName ?? ''),
      email: String(body.email ?? ''),
      rating: this.feedbackService.parseRating(body.rating),
      message: String(body.message ?? ''),
      ownerUsername,
    });
    if (!viewUser) {
      const ids = session.feedbackOwnedIds ?? [];
      ids.push(row.id);
      session.feedbackOwnedIds = ids;
    }
    return { url: `/feedback/${row.id}` };
  }

  @Patch(':id')
  @Redirect()
  async patch(
    @Session() session: AppSession,
    @Param('id') id: string,
    @Body()
    body: {
      authorName?: string;
      email?: string;
      rating?: string;
      message?: string;
    },
  ) {
    const existing = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), existing, user)) {
      return { url: '/feedback' };
    }
    await this.feedbackService.update(id, {
      authorName:
        body.authorName !== undefined
          ? String(body.authorName)
          : existing.authorName,
      email: body.email !== undefined ? String(body.email) : existing.email,
      rating:
        body.rating !== undefined
          ? this.feedbackService.parseRating(body.rating)
          : existing.rating,
      message:
        body.message !== undefined ? String(body.message) : existing.message,
    });
    return { url: `/feedback/${id}` };
  }

  @Post(':id/update')
  @Redirect()
  async updateViaForm(
    @Session() session: AppSession,
    @Param('id') id: string,
    @Body()
    body: {
      authorName: string;
      email: string;
      rating: string;
      message: string;
    },
  ) {
    const existing = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), existing, user)) {
      return { url: '/feedback' };
    }
    await this.feedbackService.update(id, {
      authorName: String(body.authorName ?? ''),
      email: String(body.email ?? ''),
      rating: this.feedbackService.parseRating(body.rating),
      message: String(body.message ?? ''),
    });
    return { url: `/feedback/${id}` };
  }

  @Delete(':id')
  @Redirect()
  async remove(@Session() session: AppSession, @Param('id') id: string) {
    const existing = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), existing, user)) {
      return { url: '/feedback' };
    }
    await this.feedbackService.remove(id);
    return { url: '/feedback' };
  }

  @Post(':id/delete')
  @Redirect()
  async removeViaForm(@Session() session: AppSession, @Param('id') id: string) {
    const existing = this.feedbackService.findOne(id);
    const user = toViewUser(session.user ?? null);
    if (!canManageFeedback(sessionSlice(session), existing, user)) {
      return { url: '/feedback' };
    }
    await this.feedbackService.remove(id);
    return { url: '/feedback' };
  }
}
