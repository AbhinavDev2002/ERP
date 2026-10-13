import { Suspense } from "react";
import { PageFrame, StatusPanel } from "@erp/ui";

import { InvitationScreen } from "@/features/organization";

export default function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Invitation">Loading the invitation.</StatusPanel>
        </PageFrame>
      }
    >
      <ResolvedInvitation params={params} />
    </Suspense>
  );
}

async function ResolvedInvitation({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  return <InvitationScreen invitationId={invitationId} />;
}
