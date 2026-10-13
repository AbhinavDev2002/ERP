import { WorkspaceHomeScreen } from "@/features/organization";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <WorkspaceHomeScreen organizationId={organizationId} />;
}
