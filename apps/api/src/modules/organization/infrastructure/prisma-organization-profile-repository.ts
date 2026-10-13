import { randomUUID } from "node:crypto";

import { OrganizationProfile } from "../domain/organization-profile.js";
import type { OrganizationProfileRepository } from "../application/organization-profile-repository.js";
import type { TenantPrismaClient } from "../../../platform/database/create-tenant-prisma-client.js";
import { transactionStorage } from "../../../platform/database/prisma-transaction-runner.js";

export class PrismaOrganizationProfileRepository implements OrganizationProfileRepository {
  constructor(private readonly database: TenantPrismaClient) {}

  async find(organizationId: string): Promise<OrganizationProfile | null> {
    const row = await this.reader().findUnique({ where: { organizationId } });
    if (!row) {
      return null;
    }

    return OrganizationProfile.create({
      organizationId: row.organizationId,
      legalName: row.legalName,
      timezone: row.timezone,
    });
  }

  async save(profile: OrganizationProfile): Promise<void> {
    await this.writer().upsert({
      where: { organizationId: profile.organizationId },
      create: {
        id: randomUUID(),
        organizationId: profile.organizationId,
        legalName: profile.legalName,
        timezone: profile.timezone,
      },
      update: {
        legalName: profile.legalName,
        timezone: profile.timezone,
      },
    });
  }

  private reader() {
    return (
      transactionStorage.getStore()?.organizationProfile ??
      this.database.organizationProfile
    );
  }

  private writer() {
    const transaction = transactionStorage.getStore();
    if (!transaction) {
      throw new Error("Organization profile writes require a transaction");
    }

    return transaction.organizationProfile;
  }
}
