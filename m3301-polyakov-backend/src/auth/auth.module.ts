import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthApiController } from './auth-api.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AuthApiController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
