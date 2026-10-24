import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { toViewUser } from '../../view-user';

function isApiPath(path: string): boolean {
  return path.startsWith('/api');
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {

    if (host.getType<string>() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.path || request.url?.split('?')[0] || '';
    const api = isApiPath(path);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const timestamp = new Date().toISOString();

      if (api) {
        const payload =
          typeof body === 'object' && body !== null
            ? { ...body, path: request.url, timestamp }
            : {
                statusCode: status,
                message: body,
                path: request.url,
                timestamp,
              };
        response.status(status).json(payload);
        return;
      }

      const message =
        typeof body === 'string'
          ? body
          : Array.isArray((body as { message?: unknown }).message)
            ? (body as { message: string[] }).message.join(', ')
            : ((body as { message?: string }).message ??
              HttpStatus[status] ??
              'Ошибка');

      const user = toViewUser(
        (request.session as { user?: { name: string; username: string } })
          ?.user ?? null,
      );

      if (status === 404) {
        response.status(status).render('error', {
          title: 'Не найдено',
          message,
          layout: 'layout',
          user,
        });
        return;
      }

      response.status(status).render('error', {
        title: 'Ошибка',
        message,
        layout: 'layout',
        user,
      });
      return;
    }

    this.logger.error(exception);

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = 'Внутренняя ошибка сервера';
    const timestamp = new Date().toISOString();

    if (api) {
      response.status(status).json({
        statusCode: status,
        message,
        path: request.url,
        timestamp,
      });
      return;
    }

    const user = toViewUser(
      (request.session as { user?: { name: string; username: string } })
        ?.user ?? null,
    );

    response.status(status).render('error', {
      title: 'Ошибка',
      message,
      layout: 'layout',
      user,
    });
  }
}
