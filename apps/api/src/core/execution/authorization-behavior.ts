import type { AuthorizationPolicy } from "./authorization-policy.js";
import type {
  ExecutionContext,
  PermissionRequest,
} from "./execution-context.js";

export class AuthorizationBehavior {
  constructor(private readonly policy: AuthorizationPolicy) {}

  async enforce(
    context: ExecutionContext,
    permission: PermissionRequest,
  ): Promise<void> {
    await this.policy.assertAllowed({ context, permission });
  }
}
