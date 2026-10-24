import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор записи аудита',
    example: 'audit-1234567890-abc123',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Идентификатор пользователя, выполнившего действие',
    example: 'admin',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({
    description: 'Тип действия',
    example: 'LOGIN',
  })
  actionType: string;

  @ApiProperty({
    description: 'Тип сущности',
    example: 'user',
  })
  entityType: string;

  @ApiPropertyOptional({
    description: 'Идентификатор сущности',
    example: 'user-123',
    nullable: true,
  })
  entityId: string | null;

  @ApiProperty({
    description: 'Дата и время действия',
    example: '2024-11-02T14:30:00.000Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'IP-адрес клиента',
    example: '192.168.1.1',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'User-Agent клиента',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
  })
  userAgent: string;

  @ApiProperty({
    description: 'Дополнительные метаданные',
    example: { path: '/api/auth/login', method: 'POST' },
  })
  metadata: Record<string, any>;
}
