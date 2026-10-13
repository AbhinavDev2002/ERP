"use client";

import { ActionButton, Cluster } from "@erp/ui";
import { useRouter } from "next/navigation";

import { authClient } from "@/shared/auth/auth-client";

export function WorkspaceHeader({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const router = useRouter();

  return (
    <header>
      <Cluster>
        <strong>{organizationName}</strong>
        <ActionButton
          onClick={() => {
            router.push("/organizations");
          }}
        >
          Switch
        </ActionButton>
        <ActionButton
          onClick={() => {
            router.push(`/${organizationId}`);
          }}
        >
          Home
        </ActionButton>
        <ActionButton
          onClick={() => {
            router.push(`/${organizationId}/members`);
          }}
        >
          Members
        </ActionButton>
        <ActionButton
          onClick={() => {
            router.push(`/${organizationId}/settings`);
          }}
        >
          Settings
        </ActionButton>
        <ActionButton
          onClick={() => {
            void authClient.signOut().then(() => {
              router.push("/login");
            });
          }}
        >
          Sign out
        </ActionButton>
        <ActionButton
          onClick={() => {
            void authClient
              .revokeSessions()
              .then(() => authClient.signOut())
              .then(() => {
                router.push("/login");
              });
          }}
        >
          Sign out everywhere
        </ActionButton>
      </Cluster>
    </header>
  );
}
