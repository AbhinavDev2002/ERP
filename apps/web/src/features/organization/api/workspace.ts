"use client";

import { workspaceContextResponseSchema } from "@erp/contracts";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api/browser-client";

export const workspaceQueryKey = ["workspace"] as const;

export function profileQueryKey(organizationId: string) {
  return ["organization", organizationId, "profile"] as const;
}

export function memberQueryKey(organizationId: string) {
  return ["organization", organizationId, "members"] as const;
}

export function useWorkspace() {
  return useQuery({
    queryKey: workspaceQueryKey,
    queryFn: () =>
      apiFetch("/api/workspace/context", (value) =>
        workspaceContextResponseSchema.parse(value),
      ),
  });
}
