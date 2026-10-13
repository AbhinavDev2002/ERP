import { z } from "zod";

export const workspaceUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
});

export const workspaceOrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  role: z.string(),
});

export const workspaceContextResponseSchema = z.object({
  user: workspaceUserSchema,
  organizations: z.array(workspaceOrganizationSchema),
  activeOrganizationId: z.string().min(1).nullable(),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
});

export type WorkspaceContextResponse = z.infer<
  typeof workspaceContextResponseSchema
>;
