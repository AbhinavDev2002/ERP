import { Suspense } from "react";
import { PageFrame, StatusPanel } from "@erp/ui";

import { LoginScreen } from "@/features/auth";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Sign in">Loading sign in.</StatusPanel>
        </PageFrame>
      }
    >
      <LoginScreen />
    </Suspense>
  );
}
