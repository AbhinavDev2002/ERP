import { MembersScreen } from "@/features/organization";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <MembersScreen organizationId={organizationId} />;
}
