import { Module } from '@nestjs/common';
import { AuditAdminController } from './audit-admin.controller';
import { AuditLogRepository } from '../database/repositories/audit-log.repository';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';

@Module({
  controllers: [AuditAdminController],
  providers: [AuditLogRepository, AuditLogInterceptor],
  exports: [AuditLogRepository, AuditLogInterceptor],
})
export class AuditModule {}
