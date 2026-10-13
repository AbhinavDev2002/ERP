import { ApplicationError } from "./application-error.js";
import type { ExecutionContext } from "./execution-context.js";

export class TenantEnforcement {
  enforce(context: ExecutionContext): void {
    if (
      context.organizationId.length === 0 ||
      context.actorUserId.length === 0
    ) {
      throw new ApplicationError(
        "forbidden",
        "You cannot use this organization",
      );
    }

    if (
      context.activeOrganizationId !== context.organizationId ||
      !context.memberOrganizationIds.includes(context.organizationId)
    ) {
      throw new ApplicationError(
        "forbidden",
        "You cannot use this organization",
      );
    }
  }
}
