import { Module } from '@nestjs/common';
import { MenuItemRepository } from './repositories/menu-item.repository';
import { FeedbackRepository } from './repositories/feedback.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  providers: [MenuItemRepository, FeedbackRepository, AuditLogRepository],
  exports: [MenuItemRepository, FeedbackRepository, AuditLogRepository],
})
export class DatabaseReferenceModule {}
