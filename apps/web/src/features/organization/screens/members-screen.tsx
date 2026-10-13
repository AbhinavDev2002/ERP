"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionButton,
  Cluster,
  Notice,
  SelectInput,
  StackColumn,
  StatusPanel,
  TextInput,
} from "@erp/ui";
import { organizationRoleNameSchema } from "@erp/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/shared/auth/auth-client";
import { memberQueryKey, useWorkspace } from "../api/workspace";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: organizationRoleNameSchema,
});

type InviteValues = z.infer<typeof inviteSchema>;

const memberRowSchema = z.object({
  id: z.string(),
  role: z.string(),
  userId: z.string(),
  user: z.object({
    email: z.string(),
    name: z.string(),
  }),
});

export function MembersScreen({ organizationId }: { organizationId: string }) {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const canInvite = Boolean(workspace.data?.permissions.invitation?.create);
  const canUpdate = Boolean(workspace.data?.permissions.member?.update);
  const canRemove = Boolean(workspace.data?.permissions.member?.delete);
  const canGrantOwner = Boolean(
    workspace.data?.permissions.organization?.delete,
  );
  const roles = (
    canGrantOwner
      ? organizationRoleNameSchema.options
      : organizationRoleNameSchema.options.filter((role) => role !== "owner")
  ).map((role) => ({ value: role, label: role }));

  const members = useQuery({
    queryKey: memberQueryKey(organizationId),
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: { organizationId },
      });
      if (result.error) {
        throw new Error("Could not load members");
      }
      return z.array(memberRowSchema).parse(readMembers(result.data));
    },
  });

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "employee" },
  });

  const invite = useMutation({
    mutationFn: async (values: InviteValues) => {
      const result = await authClient.organization.inviteMember({
        email: values.email,
        role: values.role as "owner" | "admin" | "member",
        organizationId,
      });
      if (result.error) {
        throw new Error("The invitation could not be sent");
      }
    },
    onSuccess: async () => {
      setMessage("Invitation sent");
      form.reset({ email: "", role: "employee" });
      await queryClient.invalidateQueries({
        queryKey: memberQueryKey(organizationId),
      });
    },
    onError: () => {
      setMessage("The invitation could not be sent");
    },
  });

  async function changeRole(memberId: string, role: string): Promise<void> {
    setMessage(null);
    const result = await authClient.organization.updateMemberRole({
      memberId,
      role,
      organizationId,
    });
    setMessage(result.error ? "The role could not be changed" : "Role updated");
    await queryClient.invalidateQueries({
      queryKey: memberQueryKey(organizationId),
    });
  }

  async function remove(memberId: string): Promise<void> {
    setMessage(null);
    const result = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
      organizationId,
    });
    setMessage(
      result.error ? "The member could not be removed" : "Member removed",
    );
    await queryClient.invalidateQueries({
      queryKey: memberQueryKey(organizationId),
    });
  }

  return (
    <StatusPanel title="Members">
      <StackColumn>
        {members.isLoading ? <p>Loading members.</p> : null}
        {members.isError ? (
          <Notice severity="error">Members could not be loaded.</Notice>
        ) : null}
        {members.data?.map((member) => (
          <Cluster key={member.id}>
            <span>
              {member.user.name} ({member.user.email}) — {member.role}
            </span>
            {canUpdate ? (
              <SelectInput
                id={`role-${member.id}`}
                label="Role"
                value={member.role}
                options={roles}
                onChange={(role) => {
                  void changeRole(member.id, role);
                }}
              />
            ) : null}
            {canRemove ? (
              <ActionButton
                onClick={() => {
                  void remove(member.id);
                }}
              >
                Remove
              </ActionButton>
            ) : null}
          </Cluster>
        ))}
        {canInvite ? (
          <form
            onSubmit={(event) => {
              void form.handleSubmit((values) => invite.mutate(values))(event);
            }}
          >
            <StackColumn>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="invite-email"
                    label="Email"
                    type="email"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <SelectInput
                    id="invite-role"
                    label="Role"
                    value={field.value}
                    options={roles}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <ActionButton type="submit" disabled={invite.isPending}>
                Send invitation
              </ActionButton>
            </StackColumn>
          </form>
        ) : (
          <p>You cannot invite members.</p>
        )}
        {message ? <Notice severity="info">{message}</Notice> : null}
      </StackColumn>
    </StatusPanel>
  );
}

function readMembers(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && "members" in data) {
    return data.members;
  }

  return [];
}
