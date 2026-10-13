import { InvitationScreen } from "@/features/organization";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  return <InvitationScreen invitationId={invitationId} />;
}
