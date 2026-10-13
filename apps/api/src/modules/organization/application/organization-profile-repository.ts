import type { OrganizationProfile } from "../domain/organization-profile.js";

export interface OrganizationProfileRepository {
  find(organizationId: string): Promise<OrganizationProfile | null>;
  save(profile: OrganizationProfile): Promise<void>;
}
