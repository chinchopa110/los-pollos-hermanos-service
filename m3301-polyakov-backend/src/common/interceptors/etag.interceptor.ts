import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';
import etag from 'etag';

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return data;
        }

        const handler = context.getHandler();
        const isRender = Reflect.getMetadata('__renderTemplate__', handler);
        if (isRender) {
          return data;
        }

        if (!res.headersSent) {
          const body = JSON.stringify(data);
          const tag = etag(body);
          res.setHeader('ETag', tag);

          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch && ifNoneMatch === tag) {
            res.status(304).end();
            return null;
          }
        }

        return data;
      }),
    );
  }
}
