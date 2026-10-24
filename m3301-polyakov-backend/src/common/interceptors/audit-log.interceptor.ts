import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { AuditLogRepository } from '../../database/repositories/audit-log.repository';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_METADATA_KEY = 'auditLog';

export interface AuditLogMetadata {
  actionType: string;
  entityType: string;
  getEntityId?: (data: any) => string | null;
  getMetadata?: (data: any) => Record<string, any>;
}

export function AuditLog(metadata: AuditLogMetadata) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(
      AUDIT_LOG_METADATA_KEY,
      metadata,
      descriptor.value,
    );
    return descriptor;
  };
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const handler = context.getHandler();
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_METADATA_KEY,
      handler,
    );

    if (!metadata) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const session = req.session as any;
    const user = session?.user;

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    return next.handle().pipe(
      tap((data) => {
        const entityId = metadata.getEntityId
          ? metadata.getEntityId(data)
          : null;
        const customMetadata = metadata.getMetadata
          ? metadata.getMetadata(data)
          : {};

        void this.auditLogRepository.create({
          userId: user?.username || null,
          actionType: metadata.actionType,
          entityType: metadata.entityType,
          entityId,
          ipAddress,
          userAgent,
          metadata: {
            ...customMetadata,
            path: req.path,
            method: req.method,
          },
        });
      }),
    );
  }
}
