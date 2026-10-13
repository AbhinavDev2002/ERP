import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../core/execution/application-error.js";
import { AuthorizationBehavior } from "../../../core/execution/authorization-behavior.js";
import type { AuthorizationPolicy } from "../../../core/execution/authorization-policy.js";
import { TenantEnforcement } from "../../../core/execution/tenant-enforcement.js";
import type { TransactionRunner } from "../../../core/execution/transaction-runner.js";
import { UseCaseExecutor } from "../../../core/execution/use-case-executor.js";
import {
  createApp,
  type ReadinessChecks,
} from "../../../composition/create-app.js";
import { CompleteOrganizationProfile } from "../application/complete-organization-profile.js";
import { GetOrganizationProfile } from "../application/get-organization-profile.js";
import type { OrganizationAuditRepository } from "../application/organization-audit-repository.js";
import type { OrganizationProfileRepository } from "../application/organization-profile-repository.js";
import type {
  AuthenticatedSession,
  SessionGateway,
} from "../application/session-gateway.js";
import type {
  WorkspaceContext,
  WorkspaceContextReader,
} from "../application/workspace-context-reader.js";
import type { OrganizationAuditEvent } from "../domain/organization-audit-event.js";
import type { OrganizationProfile } from "../domain/organization-profile.js";

const ready: ReadinessChecks = {
  checkDatabase: async () => undefined,
  checkCache: async () => undefined,
};

describe("organization profile routes", () => {
  it("rejects a request without a session", async () => {
    const profiles = new MemoryProfiles();
    const app = createApp(ready, {
      logger: false,
      runtime: runtime(profiles, null, allowAll),
    });
    const response = await app.inject({
      method: "PUT",
      url: "/api/organizations/org-a/profile",
      payload: { legalName: "Northwind Trading", timezone: "UTC" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: "unauthenticated",
      message: "Sign in to continue",
    });
    expect(profiles.saved).toBeNull();
    await app.close();
  });

  it("rejects another organization before writing", async () => {
    const profiles = new MemoryProfiles();
    const app = createApp(ready, {
      logger: false,
      runtime: runtime(profiles, session("org-a"), allowAll),
    });
    const response = await app.inject({
      method: "PUT",
      url: "/api/organizations/org-b/profile",
      headers: { cookie: "better-auth.session_token=session" },
      payload: { legalName: "Northwind Trading", timezone: "UTC" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("forbidden");
    expect(profiles.saved).toBeNull();
    await app.close();
  });

  it("rejects a member who lacks the update permission", async () => {
    const profiles = new MemoryProfiles();
    const app = createApp(ready, {
      logger: false,
      runtime: runtime(profiles, session("org-a"), denyAll),
    });
    const response = await app.inject({
      method: "PUT",
      url: "/api/organizations/org-a/profile",
      headers: { cookie: "better-auth.session_token=session" },
      payload: { legalName: "Northwind Trading", timezone: "UTC" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      code: "forbidden",
      message: "You cannot perform this action",
    });
    expect(profiles.saved).toBeNull();
    await app.close();
  });
});

function runtime(
  profiles: MemoryProfiles,
  current: AuthenticatedSession | null,
  policy: AuthorizationPolicy,
) {
  const sessions: SessionGateway = {
    async resolve(): Promise<AuthenticatedSession | null> {
      return current;
    },
  };
  const workspace: WorkspaceContextReader = {
    async read(): Promise<WorkspaceContext | null> {
      return null;
    },
  };
  return {
    webOrigin: "http://localhost:3000",
    auth: { handler: async () => new Response(null, { status: 404 }) },
    sessions,
    workspace,
    executor: new UseCaseExecutor(
      new TenantEnforcement(),
      new AuthorizationBehavior(policy),
      new ImmediateTransaction(),
    ),
    completeProfile: new CompleteOrganizationProfile(
      profiles,
      new MemoryAudits(),
    ),
    getProfile: new GetOrganizationProfile(profiles),
  };
}

function session(organizationId: string): AuthenticatedSession {
  return {
    userId: "user-1",
    activeOrganizationId: organizationId,
    memberOrganizationIds: [organizationId],
  };
}

const allowAll: AuthorizationPolicy = {
  async assertAllowed(): Promise<void> {
    return undefined;
  },
};

const denyAll: AuthorizationPolicy = {
  async assertAllowed(): Promise<void> {
    throw new ApplicationError("forbidden", "You cannot perform this action");
  },
};

class ImmediateTransaction implements TransactionRunner {
  async run<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}

class MemoryProfiles implements OrganizationProfileRepository {
  saved: OrganizationProfile | null = null;

  async find(): Promise<OrganizationProfile | null> {
    return this.saved;
  }

  async save(profile: OrganizationProfile): Promise<void> {
    this.saved = profile;
  }
}

class MemoryAudits implements OrganizationAuditRepository {
  async append(event: OrganizationAuditEvent): Promise<void> {
    void event;
  }
}
