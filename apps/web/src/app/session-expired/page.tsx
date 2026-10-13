import { Suspense } from "react";
import { PageFrame, StatusPanel } from "@erp/ui";

import { SessionExpiredScreen } from "@/features/auth";

export default function SessionExpiredPage() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Session expired">Loading sign in.</StatusPanel>
        </PageFrame>
      }
    >
      <SessionExpiredScreen />
    </Suspense>
  );
}
