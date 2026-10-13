"use client";

import { LinkAction, Notice, PageFrame, StatusPanel } from "@erp/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { authClient } from "@/shared/auth/auth-client";
import { WorkspaceHeader } from "@/widgets/workspace-header";
import { useWorkspace, workspaceQueryKey } from "../api/workspace";

export function WorkspaceFrame({
  organizationId,
  children,
}: {
  organizationId: string;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const workspace = useWorkspace();
  const [activationFailed, setActivationFailed] = useState(false);
  const organization = workspace.data?.organizations.find(
    (item) => item.id === organizationId,
  );

  useEffect(() => {
    if (!workspace.data || !organization || activationFailed) {
      return;
    }

    if (workspace.data.activeOrganizationId === organizationId) {
      return;
    }

    void authClient.organization
      .setActive({ organizationId })
      .then((result) => {
        if (result.error) {
          setActivationFailed(true);
          return;
        }
        return queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
      });
  }, [
    activationFailed,
    organization,
    organizationId,
    queryClient,
    workspace.data,
  ]);

  if (workspace.isLoading) {
    return (
      <PageFrame>
        <StatusPanel title="Workspace">Loading your organization.</StatusPanel>
      </PageFrame>
    );
  }

  if (
    workspace.isError ||
    !workspace.data ||
    !organization ||
    activationFailed
  ) {
    return (
      <PageFrame>
        <StatusPanel title="Unauthorized">
          <Notice severity="error">You cannot use this organization.</Notice>
          <LinkAction href="/organizations">Choose an organization</LinkAction>
        </StatusPanel>
      </PageFrame>
    );
  }

  const aligning = workspace.data.activeOrganizationId !== organizationId;

  return (
    <PageFrame>
      <WorkspaceHeader
        organizationId={organizationId}
        organizationName={organization.name}
      />
      {aligning ? (
        <StatusPanel title={organization.name}>
          Opening the workspace.
        </StatusPanel>
      ) : (
        children
      )}
    </PageFrame>
  );
}
