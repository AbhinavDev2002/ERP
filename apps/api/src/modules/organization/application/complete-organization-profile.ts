import type {
  ExecutionContext,
  UseCase,
} from "../../../core/execution/execution-context.js";
import { OrganizationAuditEvent } from "../domain/organization-audit-event.js";
import { OrganizationProfile } from "../domain/organization-profile.js";
import type { OrganizationAuditRepository } from "./organization-audit-repository.js";
import type { OrganizationProfileRepository } from "./organization-profile-repository.js";

export class CompleteOrganizationProfile implements UseCase<
  { readonly legalName: string; readonly timezone: string },
  OrganizationProfile
> {
  readonly requiresTransaction = true;
  readonly requiredPermission = { organization: ["update"] };

  constructor(
    private readonly profiles: OrganizationProfileRepository,
    private readonly audits: OrganizationAuditRepository,
  ) {}

  async execute(
    input: { readonly legalName: string; readonly timezone: string },
    context: ExecutionContext,
  ): Promise<OrganizationProfile> {
    const existing = await this.profiles.find(context.organizationId);
    const profile = OrganizationProfile.create({
      organizationId: context.organizationId,
      legalName: input.legalName,
      timezone: input.timezone,
    });
    await this.profiles.save(profile);
    await this.audits.append(
      new OrganizationAuditEvent(
        context.organizationId,
        context.actorUserId,
        existing === null
          ? "organization_profile.completed"
          : "organization_profile.updated",
      ),
    );
    return profile;
  }
}
