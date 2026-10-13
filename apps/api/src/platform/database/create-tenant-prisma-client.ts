import type { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../core/execution/application-error.js";
import { currentTenant } from "../../core/execution/tenant-context.js";

export function createTenantPrismaClient(base: PrismaClient) {
  return base.$extends({
    query: {
      organizationProfile: {
        $allOperations({ operation, args, query }) {
          return query(scopeArgs(operation, args, requireOrganizationId()));
        },
      },
      organizationAuditEvent: {
        $allOperations({ operation, args, query }) {
          return query(scopeArgs(operation, args, requireOrganizationId()));
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof createTenantPrismaClient>;

function requireOrganizationId(): string {
  const tenant = currentTenant();
  if (!tenant || tenant.organizationId.length === 0) {
    throw new ApplicationError("forbidden", "You cannot use this organization");
  }

  return tenant.organizationId;
}

function scopeArgs<T>(operation: string, args: T, organizationId: string): T {
  const record = asRecord(args);
  if (operation === "create") {
    return { ...record, data: scopeRecord(record.data, organizationId) } as T;
  }

  if (operation === "createMany") {
    const rows = Array.isArray(record.data) ? record.data : [];
    return {
      ...record,
      data: rows.map((row) => scopeRecord(row, organizationId)),
    } as T;
  }

  if (operation === "upsert") {
    return {
      ...record,
      where: scopeRecord(record.where, organizationId),
      create: scopeRecord(record.create, organizationId),
    } as T;
  }

  if (scopedOperations.has(operation)) {
    return { ...record, where: scopeRecord(record.where, organizationId) } as T;
  }

  return args;
}

const scopedOperations = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

function scopeRecord(
  value: unknown,
  organizationId: string,
): Record<string, unknown> {
  const record = asRecord(value);
  const current = record.organizationId;
  if (typeof current === "string" && current !== organizationId) {
    throw new ApplicationError("forbidden", "You cannot use this organization");
  }

  return { ...record, organizationId };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }

  return {};
}
