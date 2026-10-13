import {
  workspaceContextResponseSchema,
  type WorkspaceContextResponse,
} from "@erp/contracts";
import { cookies } from "next/headers";

import { apiUrl } from "../api/api-url";

export async function readWorkspace(): Promise<WorkspaceContextResponse | null> {
  const jar = await cookies();
  const cookie = jar
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
  if (!cookie.includes("session_token")) {
    return null;
  }

  const response = await fetch(`${apiUrl}/api/workspace/context`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Workspace context failed");
  }

  return workspaceContextResponseSchema.parse(await response.json());
}
