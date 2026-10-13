"use client";

import { LinkAction, PageFrame, StatusPanel } from "@erp/ui";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function SessionExpiredScreen() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Session expired">Loading.</StatusPanel>
        </PageFrame>
      }
    >
      <Expired />
    </Suspense>
  );
}

function Expired() {
  const search = useSearchParams();
  const returnTo = search.get("returnTo");
  const href = returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/login";

  return (
    <PageFrame>
      <StatusPanel title="Session expired">
        Sign in again to continue.
        <LinkAction href={href}>Sign in</LinkAction>
      </StatusPanel>
    </PageFrame>
  );
}
