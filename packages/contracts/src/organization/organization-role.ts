import { z } from "zod";

export const organizationRoleNameSchema = z.enum([
  "owner",
  "admin",
  "manager",
  "employee",
  "viewer",
]);

export type OrganizationRoleName = z.infer<typeof organizationRoleNameSchema>;
