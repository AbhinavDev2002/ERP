import { AsyncLocalStorage } from "node:async_hooks";

import type { ExecutionSource } from "./execution-context.js";

export interface TenantContext {
  readonly organizationId: string;
  readonly actorUserId: string;
  readonly source: ExecutionSource;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function currentTenant(): TenantContext | undefined {
  return tenantStorage.getStore();
}
