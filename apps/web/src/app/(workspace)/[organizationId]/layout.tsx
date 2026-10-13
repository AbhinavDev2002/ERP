import type { ReactNode } from "react";

import { WorkspaceFrame } from "@/features/organization";

export default async function WorkspaceLayout({
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
