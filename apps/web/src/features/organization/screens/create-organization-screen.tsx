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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/shared/auth/auth-client";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter the business name").max(80),
});

type CreateValues = z.infer<typeof createSchema>;

export function CreateOrganizationScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateValues): Promise<void> {
    setMessage(null);
    const created = await authClient.organization.create({
      name: values.name.trim(),
      slug: slugFromName(values.name),
    });
    if (created.error || !created.data) {
      setMessage("The organization could not be created");
      return;
    }

    const organizationId = created.data.id;
    await authClient.organization.setActive({ organizationId });
    router.push(`/${organizationId}/settings`);
  }

  return (
    <PageFrame>
      <StatusPanel title="Create a business">
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          <StackColumn>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  id="organization-name"
                  label="Business name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            {message ? <Notice severity="error">{message}</Notice> : null}
            <ActionButton type="submit" disabled={form.formState.isSubmitting}>
              Create organization
            </ActionButton>
          </StackColumn>
        </form>
      </StatusPanel>
    </PageFrame>
  );
}

function slugFromName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base.length > 0 ? base : "organization"}-${suffix}`;
}
