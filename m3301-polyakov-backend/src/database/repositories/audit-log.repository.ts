import { Injectable } from '@nestjs/common';
import type { AuditLogEntity } from '../entities/audit-log.entity';

export interface AuditLogFilters {
  userId?: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AuditLogRepository {
  private readonly store = new Map<string, AuditLogEntity>();

  create(
    input: Omit<AuditLogEntity, 'id' | 'timestamp'>,
  ): Promise<AuditLogEntity> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const row: AuditLogEntity = {
      ...input,
      id,
      timestamp: new Date(),
    };
    this.store.set(id, row);
    return Promise.resolve(row);
  }

  findAll(filters?: AuditLogFilters): AuditLogEntity[] {
    let results = [...this.store.values()];

    if (filters) {
      if (filters.userId) {
        results = results.filter((log) => log.userId === filters.userId);
      }
      if (filters.actionType) {
        results = results.filter(
          (log) => log.actionType === filters.actionType,
        );
      }
      if (filters.entityType) {
        results = results.filter(
          (log) => log.entityType === filters.entityType,
        );
      }
      if (filters.entityId) {
        results = results.filter((log) => log.entityId === filters.entityId);
      }
      if (filters.startDate) {
        results = results.filter(
          (log) => log.timestamp >= filters.startDate!,
        );
      }
      if (filters.endDate) {
        results = results.filter((log) => log.timestamp <= filters.endDate!);
      }
    }

    return results.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  findById(id: string): AuditLogEntity | undefined {
    return this.store.get(id);
  }
}
