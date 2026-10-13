import type {
  ExecutionContext,
  UseCase,
} from "../../../core/execution/execution-context.js";
import type { OrganizationProfile } from "../domain/organization-profile.js";
import type { OrganizationProfileRepository } from "./organization-profile-repository.js";

export class GetOrganizationProfile implements UseCase<
  Record<string, never>,
  OrganizationProfile | null
> {
  readonly requiresTransaction = false;
  readonly requiredPermission = { organization: ["read"] };

  constructor(private readonly profiles: OrganizationProfileRepository) {}

  execute(
    _input: Record<string, never>,
    context: ExecutionContext,
  ): Promise<OrganizationProfile | null> {
    return this.profiles.find(context.organizationId);
  }
}
