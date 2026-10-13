import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ApplicationError } from "../../../core/execution/application-error.js";
import { AuthorizationBehavior } from "../../../core/execution/authorization-behavior.js";
import type { AuthorizationPolicy } from "../../../core/execution/authorization-policy.js";
import type { ExecutionContext } from "../../../core/execution/execution-context.js";
import { tenantStorage } from "../../../core/execution/tenant-context.js";
import { TenantEnforcement } from "../../../core/execution/tenant-enforcement.js";
import { UseCaseExecutor } from "../../../core/execution/use-case-executor.js";
import { createTenantPrismaClient } from "../../../platform/database/create-tenant-prisma-client.js";
import { PrismaTransactionRunner } from "../../../platform/database/prisma-transaction-runner.js";
import { CompleteOrganizationProfile } from "../application/complete-organization-profile.js";
import type { OrganizationAuditRepository } from "../application/organization-audit-repository.js";
import type { OrganizationAuditEvent } from "../domain/organization-audit-event.js";
import { PrismaOrganizationAuditRepository } from "./prisma-organization-audit-repository.js";
import { PrismaOrganizationProfileRepository } from "./prisma-organization-profile-repository.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required");
}
if (testDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error("Tests must not use DATABASE_URL");
}

const database = new PrismaClient({
  datasources: { db: { url: testDatabaseUrl } },
});
const tenantDatabase = createTenantPrismaClient(database);
const profiles = new PrismaOrganizationProfileRepository(tenantDatabase);
const audits = new PrismaOrganizationAuditRepository();
const allowAll: AuthorizationPolicy = {
  async assertAllowed() {
    return undefined;
  },
};
const executor = new UseCaseExecutor(
  new TenantEnforcement(),
  new AuthorizationBehavior(allowAll),
  new PrismaTransactionRunner(tenantDatabase),
);

describe("organization persistence", () => {
  const userId = randomUUID();
  const organizationA = randomUUID();
  const organizationB = randomUUID();

  beforeAll(async () => {
    execFileSync(
      process.execPath,
      [
        "./node_modules/prisma/build/index.js",
        "migrate",
        "deploy",
        "--schema=prisma/schema",
      ],
      {
        cwd: fileURLToPath(new URL("../../../../", import.meta.url)),
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
        stdio: "pipe",
      },
    );
    await database.user.create({
      data: {
        id: userId,
        name: "Avery Owner",
        email: `${userId}@example.com`,
        emailVerified: true,
      },
    });
    await database.organization.createMany({
      data: [
        { id: organizationA, name: "Northwind", slug: organizationA },
        { id: organizationB, name: "Contoso", slug: organizationB },
      ],
    });
    await database.member.createMany({
      data: [
        {
          id: randomUUID(),
          organizationId: organizationA,
          userId,
          role: "owner",
        },
        {
          id: randomUUID(),
          organizationId: organizationB,
          userId,
          role: "owner",
        },
      ],
    });
  }, 60_000);

  afterAll(async () => {
    await database.organization.deleteMany({
      where: { id: { in: [organizationA, organizationB] } },
    });
    await database.user.deleteMany({ where: { id: userId } });
    await database.$disconnect();
  });

  it("rolls back the profile when the audit write fails", async () => {
    await expect(
      executor.execute(
        new CompleteOrganizationProfile(profiles, new FailingAudits(audits)),
        { legalName: "Northwind Trading", timezone: "UTC" },
        contextFor(userId, organizationA),
      ),
    ).rejects.toThrow(/audit failed/);

    expect(
      await database.organizationProfile.findUnique({
        where: { organizationId: organizationA },
      }),
    ).toBeNull();
    expect(
      await database.organizationAuditEvent.findMany({
        where: { organizationId: organizationA },
      }),
    ).toEqual([]);
  });

  it("hides a profile written in one organization from another organization", async () => {
    await executor.execute(
      new CompleteOrganizationProfile(profiles, audits),
      { legalName: "Northwind Trading", timezone: "America/New_York" },
      contextFor(userId, organizationA),
    );

    const visibleInB = await tenantStorage.run(
      {
        organizationId: organizationB,
        actorUserId: userId,
        source: "request",
      },
      () => profiles.find(organizationB),
    );

    expect(visibleInB).toBeNull();
    expect(
      await database.organizationProfile.findUnique({
        where: { organizationId: organizationA },
      }),
    ).toMatchObject({ legalName: "Northwind Trading" });
  });

  it("does not write when the session organization does not match", async () => {
    await expect(
      executor.execute(
        new CompleteOrganizationProfile(profiles, audits),
        { legalName: "Contoso Ltd", timezone: "UTC" },
        {
          ...contextFor(userId, organizationB),
          activeOrganizationId: organizationA,
          memberOrganizationIds: [organizationA],
        },
      ),
    ).rejects.toBeInstanceOf(ApplicationError);

    expect(
      await database.organizationProfile.findUnique({
        where: { organizationId: organizationB },
      }),
    ).toBeNull();
  });
});

function contextFor(userId: string, organizationId: string): ExecutionContext {
  return {
    actorUserId: userId,
    organizationId,
    activeOrganizationId: organizationId,
    memberOrganizationIds: [organizationId],
    source: "request",
    headers: new Headers(),
  };
}

class FailingAudits implements OrganizationAuditRepository {
  constructor(private readonly inner: OrganizationAuditRepository) {}

  async append(event: OrganizationAuditEvent): Promise<void> {
    await this.inner.append(event);
    throw new Error("audit failed");
  }
}
