import { describe, expect, it } from "vitest";

import type { ExecutionContext } from "../../../core/execution/execution-context.js";
import { OrganizationAuditEvent } from "../domain/organization-audit-event.js";
import type { OrganizationProfile } from "../domain/organization-profile.js";
import type { OrganizationAuditRepository } from "./organization-audit-repository.js";
import type { OrganizationProfileRepository } from "./organization-profile-repository.js";
import { CompleteOrganizationProfile } from "./complete-organization-profile.js";

describe("CompleteOrganizationProfile", () => {
  it("saves the profile and records an audit event", async () => {
    const profiles = new MemoryProfiles();
    const audits = new MemoryAudits();
    const useCase = new CompleteOrganizationProfile(profiles, audits);

    const saved = await useCase.execute(
      { legalName: "Northwind Trading", timezone: "America/New_York" },
      context,
    );

    expect(saved.legalName).toBe("Northwind Trading");
    expect(profiles.saved?.timezone).toBe("America/New_York");
    expect(audits.events).toEqual([
      expect.objectContaining({ action: "organization_profile.completed" }),
    ]);
  });

  it("rejects the command when the audit write fails", async () => {
    const profiles = new MemoryProfiles();
    const audits = new FailingAudits();
    const useCase = new CompleteOrganizationProfile(profiles, audits);

    await expect(
      useCase.execute(
        { legalName: "Northwind Trading", timezone: "UTC" },
        context,
      ),
    ).rejects.toThrow(/audit failed/);
  });
});

const context: ExecutionContext = {
  actorUserId: "user-1",
  organizationId: "org-1",
  activeOrganizationId: "org-1",
  memberOrganizationIds: ["org-1"],
  source: "request",
  headers: new Headers(),
};

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
  readonly events: OrganizationAuditEvent[] = [];

  async append(event: OrganizationAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

class FailingAudits implements OrganizationAuditRepository {
  async append(): Promise<void> {
    throw new Error("audit failed");
  }
}
