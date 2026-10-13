import { Suspense } from "react";

import { WorkspaceHomeScreen } from "@/features/organization";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ResolvedHome params={params} />
    </Suspense>
  );
}

async function ResolvedHome({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <WorkspaceHomeScreen organizationId={organizationId} />;
}
