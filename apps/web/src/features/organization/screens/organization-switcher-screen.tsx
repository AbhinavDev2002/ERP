"use client";

import { ActionButton, PageFrame, StackColumn, StatusPanel } from "@erp/ui";
import { useRouter } from "next/navigation";

import { authClient } from "@/shared/auth/auth-client";
import { useWorkspace } from "../api/workspace";

export function OrganizationSwitcherScreen() {
  const router = useRouter();
  const workspace = useWorkspace();

  async function open(organizationId: string): Promise<void> {
    await authClient.organization.setActive({ organizationId });
    router.push(`/${organizationId}`);
  }

  return (
    <PageFrame>
      <StatusPanel title="Choose an organization">
        {workspace.isLoading ? <p>Loading organizations.</p> : null}
        {workspace.data && workspace.data.organizations.length === 0 ? (
          <p>You do not belong to an organization yet.</p>
        ) : null}
        <StackColumn>
          {workspace.data?.organizations.map((organization) => (
            <ActionButton
              key={organization.id}
              onClick={() => {
                void open(organization.id);
              }}
            >
              {organization.name}
            </ActionButton>
          ))}
        </StackColumn>
      </StatusPanel>
    </PageFrame>
  );
}
