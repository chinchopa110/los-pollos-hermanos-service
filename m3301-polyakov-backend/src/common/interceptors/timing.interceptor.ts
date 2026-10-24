import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const contextType = context.getType<'http' | 'graphql'>();

    if (contextType === 'graphql') {
      return next.handle().pipe(
        tap(() => {
          const elapsed = Date.now() - start;
          this.logger.log(`[GraphQL] ${elapsed} ms`);
        }),
      );
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const elapsed = Date.now() - start;
        this.logger.log(`[${req.method}] ${req.url} — ${elapsed} ms`);

        const handler = context.getHandler();
        const isRender = Reflect.getMetadata('__renderTemplate__', handler);

        if (isRender) {
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            return { ...data, serverElapsedMs: elapsed };
          }
          return data;
        }

        if (!res.headersSent) {
          res.setHeader('X-Elapsed-Time', String(elapsed));
        }

        return data;
      }),
    );
  }
}
