import { Suspense } from "react";

import { MembersScreen } from "@/features/organization";

export default function MembersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ResolvedMembers params={params} />
    </Suspense>
  );
}

async function ResolvedMembers({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <MembersScreen organizationId={organizationId} />;
}
