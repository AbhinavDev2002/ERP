import { randomUUID } from "node:crypto";

import type { OrganizationAuditRepository } from "../application/organization-audit-repository.js";
import type { OrganizationAuditEvent } from "../domain/organization-audit-event.js";
import { transactionStorage } from "../../../platform/database/prisma-transaction-runner.js";

export class PrismaOrganizationAuditRepository implements OrganizationAuditRepository {
  async append(event: OrganizationAuditEvent): Promise<void> {
    const transaction = transactionStorage.getStore();
    if (!transaction) {
      throw new Error("Organization audit writes require a transaction");
    }

    await transaction.organizationAuditEvent.create({
      data: {
        id: randomUUID(),
        organizationId: event.organizationId,
        actorUserId: event.actorUserId,
        action: event.action,
      },
    });
  }
}
