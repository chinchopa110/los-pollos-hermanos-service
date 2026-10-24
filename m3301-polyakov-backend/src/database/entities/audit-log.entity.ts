export interface AuditLogEntity {
  id: string;
  userId: string | null;
  actionType: string;
  entityType: string;
  entityId: string | null;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}
