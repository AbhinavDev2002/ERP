import type { OrganizationAuditEvent } from "../domain/organization-audit-event.js";

export interface OrganizationAuditRepository {
  append(event: OrganizationAuditEvent): Promise<void>;
}
