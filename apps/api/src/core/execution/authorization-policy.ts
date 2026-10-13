import type {
  ExecutionContext,
  PermissionRequest,
} from "./execution-context.js";

export interface AuthorizationPolicy {
  assertAllowed(input: {
    readonly context: ExecutionContext;
    readonly permission: PermissionRequest;
  }): Promise<void>;
}
