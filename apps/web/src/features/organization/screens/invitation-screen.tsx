"use client";

import {
  ActionButton,
  Cluster,
  LinkAction,
  Notice,
  PageFrame,
  StackColumn,
  StatusPanel,
} from "@erp/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/shared/auth/auth-client";
import { useWorkspace } from "../api/workspace";

export function InvitationScreen({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const workspace = useWorkspace();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function accept(): Promise<void> {
    setPending(true);
    setMessage(null);
    const result = await authClient.organization.acceptInvitation({
      invitationId,
    });
    setPending(false);
    if (result.error || !result.data) {
      setMessage("The invitation could not be accepted");
      return;
    }

    const organizationId = result.data.invitation.organizationId;
    await authClient.organization.setActive({ organizationId });
    router.push(`/${organizationId}`);
  }

  async function reject(): Promise<void> {
    setPending(true);
    setMessage(null);
    const result = await authClient.organization.rejectInvitation({
      invitationId,
    });
    setPending(false);
    if (result.error) {
      setMessage("The invitation could not be declined");
      return;
    }
    router.push("/no-organization");
  }

  return (
    <PageFrame>
      <StatusPanel title="Invitation">
        <StackColumn>
          {workspace.data?.user.email ? (
            <p>Signed in as {workspace.data.user.email}.</p>
          ) : null}
          <p>Accept the invitation to join this business.</p>
          {message ? <Notice severity="error">{message}</Notice> : null}
          <Cluster>
            <ActionButton
              disabled={pending}
              onClick={() => {
                void accept();
              }}
            >
              Accept
            </ActionButton>
            <ActionButton
              disabled={pending}
              onClick={() => {
                void reject();
              }}
            >
              Decline
            </ActionButton>
            <LinkAction href="/no-organization">Not now</LinkAction>
          </Cluster>
        </StackColumn>
      </StatusPanel>
    </PageFrame>
  );
}
