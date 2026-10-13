import { Suspense } from "react";

import { ProfileSettingsScreen } from "@/features/organization";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ResolvedSettings params={params} />
    </Suspense>
  );
}

async function ResolvedSettings({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <ProfileSettingsScreen organizationId={organizationId} />;
}
