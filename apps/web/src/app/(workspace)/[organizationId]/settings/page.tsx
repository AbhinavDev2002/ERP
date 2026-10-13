import { ProfileSettingsScreen } from "@/features/organization";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <ProfileSettingsScreen organizationId={organizationId} />;
}
