import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class AuditLogQueryDto {
  @ApiPropertyOptional({
    description: 'Фильтр по идентификатору пользователя',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по типу действия',
    example: 'LOGIN',
  })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по типу сущности',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по идентификатору сущности',
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Начальная дата для фильтрации (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Конечная дата для фильтрации (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
