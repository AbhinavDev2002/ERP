"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionButton,
  Notice,
  PageFrame,
  StackColumn,
  StatusPanel,
  TextInput,
} from "@erp/ui";
import { workspaceContextResponseSchema } from "@erp/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { apiFetch } from "@/shared/api/browser-client";
import { authClient } from "@/shared/auth/auth-client";
import {
  organizationIdFromPath,
  workspaceDestination,
} from "@/shared/auth/destination";

const verifySchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6 digit code"),
});

type VerifyValues = z.infer<typeof verifySchema>;

export function VerifyScreen() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Enter your code">Loading.</StatusPanel>
        </PageFrame>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const router = useRouter();
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const [message, setMessage] = useState<string | null>(
    email.length === 0 ? "Start again from the email step." : null,
  );
  const form = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { otp: "" },
  });

  async function onSubmit(values: VerifyValues): Promise<void> {
    setMessage(null);
    const result = await authClient.signIn.emailOtp({
      email,
      otp: values.otp,
    });
    if (result.error) {
      setMessage("That code is not valid");
      return;
    }

    const workspace = await apiFetch("/api/workspace/context", (value) =>
      workspaceContextResponseSchema.parse(value),
    );
    const destination = workspaceDestination({
      organizations: workspace.organizations,
      invitationId: search.get("invitation"),
      returnTo: search.get("returnTo"),
    });
    const organizationId = organizationIdFromPath(destination);
    if (
      organizationId &&
      workspace.organizations.some(
        (organization) => organization.id === organizationId,
      ) &&
      workspace.activeOrganizationId !== organizationId
    ) {
      await authClient.organization.setActive({ organizationId });
    }
    router.push(destination);
  }

  return (
    <PageFrame>
      <StatusPanel title="Enter your code">
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          <StackColumn>
            <Controller
              name="otp"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  id="otp"
                  label="Code"
                  autoComplete="one-time-code"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            {message ? <Notice severity="error">{message}</Notice> : null}
            <ActionButton type="submit" disabled={form.formState.isSubmitting}>
              Continue
            </ActionButton>
          </StackColumn>
        </form>
      </StatusPanel>
    </PageFrame>
  );
}
