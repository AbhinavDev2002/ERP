export type ExecutionSource = "request" | "job";

export interface ExecutionContext {
  readonly actorUserId: string;
  readonly organizationId: string;
  readonly activeOrganizationId: string | null;
  readonly memberOrganizationIds: readonly string[];
  readonly source: ExecutionSource;
  readonly headers: Headers;
}

export interface PermissionRequest {
  readonly [resource: string]: readonly string[];
}

export interface UseCase<TInput, TOutput> {
  readonly requiresTransaction: boolean;
  readonly requiredPermission: PermissionRequest;
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;
}
