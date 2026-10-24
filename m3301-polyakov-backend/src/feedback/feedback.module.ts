import { Module } from '@nestjs/common';
import { DatabaseReferenceModule } from '../database/database-reference.module';
import { AuditModule } from '../audit/audit.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackApiController } from './feedback-api.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackResolver } from './feedback.resolver';

@Module({
  imports: [DatabaseReferenceModule, AuditModule],
  controllers: [FeedbackController, FeedbackApiController],
  providers: [FeedbackService, FeedbackResolver],
  exports: [FeedbackService],
})
export class FeedbackModule {}
