import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFrame, StatusPanel } from "@erp/ui";

import { workspaceDestination } from "@/shared/auth/destination";
import { readWorkspace } from "@/shared/auth/read-workspace";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="ERP">Checking your session.</StatusPanel>
        </PageFrame>
      }
    >
      <HomeRedirect />
    </Suspense>
  );
}

async function HomeRedirect() {
  const workspace = await readWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  redirect(
    workspaceDestination({
      organizations: workspace.organizations,
      invitationId: null,
      returnTo: null,
    }),
  );
  return null;
}
