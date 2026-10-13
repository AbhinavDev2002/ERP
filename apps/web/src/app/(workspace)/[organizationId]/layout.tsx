import { Suspense, type ReactNode } from "react";
import { PageFrame, StatusPanel } from "@erp/ui";

import { WorkspaceFrame } from "@/features/organization";

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Workspace">Loading the workspace.</StatusPanel>
        </PageFrame>
      }
    >
      <ResolvedWorkspace params={params}>{children}</ResolvedWorkspace>
    </Suspense>
  );
}

async function ResolvedWorkspace({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return (
    <WorkspaceFrame organizationId={organizationId}>{children}</WorkspaceFrame>
  );
}
