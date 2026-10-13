"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionButton,
  Cluster,
  Notice,
  PageFrame,
  StackColumn,
  StatusPanel,
  TextInput,
} from "@erp/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/shared/auth/auth-client";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginScreen() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <StatusPanel title="Sign in">Preparing sign in.</StatusPanel>
        </PageFrame>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: LoginValues): Promise<void> {
    setMessage(null);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: values.email,
      type: "sign-in",
    });
    if (result.error) {
      setMessage("We could not send a code. Try again.");
      return;
    }

    const params = new URLSearchParams({ email: values.email });
    const returnTo = search.get("returnTo");
    const invitation = search.get("invitation");
    if (returnTo) {
      params.set("returnTo", returnTo);
    }
    if (invitation) {
      params.set("invitation", invitation);
    }
    router.push(`/login/verify?${params.toString()}`);
  }

  async function startSocial(provider: "google" | "microsoft"): Promise<void> {
    setMessage(null);
    const returnTo = search.get("returnTo");
    const result = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}${returnTo && returnTo.startsWith("/") ? returnTo : "/"}`,
    });
    if (result.error) {
      setMessage("That sign-in method is unavailable");
    }
  }

  return (
    <PageFrame>
      <StatusPanel title="Sign in">
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          <StackColumn>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            {message ? <Notice severity="error">{message}</Notice> : null}
            <ActionButton type="submit" disabled={form.formState.isSubmitting}>
              Email me a code
            </ActionButton>
            <Cluster>
              <ActionButton
                onClick={() => {
                  void startSocial("google");
                }}
              >
                Google
              </ActionButton>
              <ActionButton
                onClick={() => {
                  void startSocial("microsoft");
                }}
              >
                Microsoft
              </ActionButton>
            </Cluster>
          </StackColumn>
        </form>
      </StatusPanel>
    </PageFrame>
  );
}
