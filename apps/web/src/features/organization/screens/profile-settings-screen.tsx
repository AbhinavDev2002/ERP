"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionButton,
  Notice,
  StackColumn,
  StatusPanel,
  TextInput,
} from "@erp/ui";
import {
  completeOrganizationProfileRequestSchema,
  organizationProfileResponseSchema,
  type CompleteOrganizationProfileRequest,
} from "@erp/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ApiRequestError, apiFetch } from "@/shared/api/browser-client";
import { profileQueryKey, useWorkspace } from "../api/workspace";

export function ProfileSettingsScreen({
  organizationId,
}: {
  organizationId: string;
}) {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const canRead = Boolean(workspace.data?.permissions.organization?.read);
  const canUpdate = Boolean(workspace.data?.permissions.organization?.update);
  const profile = useQuery({
    queryKey: profileQueryKey(organizationId),
    enabled: canRead,
    queryFn: async () => {
      try {
        return await apiFetch(
          `/api/organizations/${organizationId}/profile`,
          (value) => organizationProfileResponseSchema.parse(value),
        );
      } catch (error: unknown) {
        if (error instanceof ApiRequestError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
  const form = useForm<CompleteOrganizationProfileRequest>({
    resolver: zodResolver(completeOrganizationProfileRequestSchema),
    defaultValues: { legalName: "", timezone: "UTC" },
  });

  useEffect(() => {
    if (!profile.data) {
      return;
    }

    form.reset({
      legalName: profile.data.legalName,
      timezone: profile.data.timezone,
    });
  }, [form, profile.data]);

  const save = useMutation({
    mutationFn: (values: CompleteOrganizationProfileRequest) =>
      apiFetch(
        `/api/organizations/${organizationId}/profile`,
        (value) => organizationProfileResponseSchema.parse(value),
        { method: "PUT", body: JSON.stringify(values) },
      ),
    onSuccess: async () => {
      setMessage("Profile saved");
      await queryClient.invalidateQueries({
        queryKey: profileQueryKey(organizationId),
      });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiRequestError && error.status === 403) {
        setMessage("You cannot update this organization");
        return;
      }
      setMessage("The profile could not be saved");
    },
  });

  if (!canRead) {
    return (
      <StatusPanel title="Organization profile">
        <p>You cannot view this profile.</p>
      </StatusPanel>
    );
  }

  return (
    <StatusPanel title="Organization profile">
      <form
        onSubmit={(event) => {
          void form.handleSubmit((values) => save.mutate(values))(event);
        }}
      >
        <StackColumn>
          {profile.isLoading ? <p>Loading profile.</p> : null}
          {profile.isError ? (
            <Notice severity="error">The profile could not be loaded.</Notice>
          ) : null}
          <Controller
            name="legalName"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                id="legal-name"
                label="Legal name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="timezone"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                id="timezone"
                label="Timezone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          {message ? <Notice severity="info">{message}</Notice> : null}
          {canUpdate ? (
            <ActionButton type="submit" disabled={save.isPending}>
              Save profile
            </ActionButton>
          ) : (
            <p>You can view this profile.</p>
          )}
        </StackColumn>
      </form>
    </StatusPanel>
  );
}
