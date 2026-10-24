import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiSecurity,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuditLogRepository } from '../database/repositories/audit-log.repository';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';
import { RestApiTags } from '../common/swagger/rest-api-tags';

@ApiTags(RestApiTags.admin)
@ApiSecurity('session')
@Controller('api/admin')
@UseGuards(AdminGuard)
export class AuditAdminController {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  @Get('audit-log')
  @ApiOperation({
    summary: 'Получить записи аудит лога',
    description:
      'Возвращает список всех записей аудита с возможностью фильтрации по различным параметрам. Доступ только для администратора.',
  })
  @ApiOkResponse({
    description: 'Список записей аудита',
    type: [AuditLogResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Некорректные параметры запроса',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация или недостаточно прав',
  })
  getAuditLog(@Query() query: AuditLogQueryDto): AuditLogResponseDto[] {
    const filters = {
      userId: query.userId,
      actionType: query.actionType,
      entityType: query.entityType,
      entityId: query.entityId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return this.auditLogRepository.findAll(filters);
  }
}
