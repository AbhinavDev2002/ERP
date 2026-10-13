import { Suspense } from "react";
import { PageFrame, StatusPanel } from "@erp/ui";

import { VerifyScreen } from "@/features/auth";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Check your email">
            Loading the code form.
          </StatusPanel>
        </PageFrame>
      }
    >
      <VerifyScreen />
    </Suspense>
  );
}
