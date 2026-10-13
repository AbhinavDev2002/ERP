import { isAPIError } from "better-auth/api";

import { ApplicationError } from "../../core/execution/application-error.js";
import type { AuthorizationPolicy } from "../../core/execution/authorization-policy.js";
import type { PermissionRequest } from "../../core/execution/execution-context.js";
import type { AppAuth } from "./create-auth.js";

export class BetterAuthAuthorizationPolicy implements AuthorizationPolicy {
  constructor(private readonly auth: AppAuth) {}

  async assertAllowed(input: {
    readonly context: { readonly headers: Headers };
    readonly permission: PermissionRequest;
  }): Promise<void> {
    const permissions: Record<string, string[]> = {};
    for (const [resource, actions] of Object.entries(input.permission)) {
      permissions[resource] = [...actions];
    }

    try {
      const result = await this.auth.api.hasPermission({
        headers: input.context.headers,
        body: { permissions },
      });
      if (!result.success) {
        throw new ApplicationError(
          "forbidden",
          "You cannot perform this action",
        );
      }
    } catch (error: unknown) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      if (isAPIError(error)) {
        throw new ApplicationError(
          "forbidden",
          "You cannot perform this action",
        );
      }

      throw error;
    }
  }
}
