import { z } from "zod";

export const completeOrganizationProfileRequestSchema = z
  .object({
    legalName: z.string().trim().min(1).max(200),
    timezone: z.string().trim().min(1).max(100),
  })
  .strict();

export const organizationProfileResponseSchema = z.object({
  organizationId: z.string().min(1),
  legalName: z.string(),
  timezone: z.string(),
});

export type CompleteOrganizationProfileRequest = z.infer<
  typeof completeOrganizationProfileRequestSchema
>;

export type OrganizationProfileResponse = z.infer<
  typeof organizationProfileResponseSchema
>;
