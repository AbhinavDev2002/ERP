"use client";

import { LinkAction, StatusPanel } from "@erp/ui";

import { useWorkspace } from "../api/workspace";

export function WorkspaceHomeScreen({
  organizationId,
}: {
  organizationId: string;
}) {
  const workspace = useWorkspace();
  const organization = workspace.data?.organizations.find(
    (item) => item.id === organizationId,
  );

  return (
    <StatusPanel title={organization?.name ?? "Workspace"}>
      <p>Your role is {organization?.role ?? "member"}.</p>
      <LinkAction href={`/${organizationId}/settings`}>
        Organization profile
      </LinkAction>
    </StatusPanel>
  );
}
