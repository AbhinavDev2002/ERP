import {
  completeOrganizationProfileRequestSchema,
  organizationProfileResponseSchema,
  workspaceContextResponseSchema,
} from "@erp/contracts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { ApplicationError } from "../../../core/execution/application-error.js";
import type { ExecutionContext } from "../../../core/execution/execution-context.js";
import type { UseCaseExecutor } from "../../../core/execution/use-case-executor.js";
import { cookieHeaders } from "../../../platform/auth/better-auth-session-gateway.js";
import type { CompleteOrganizationProfile } from "../application/complete-organization-profile.js";
import type { GetOrganizationProfile } from "../application/get-organization-profile.js";
import type { SessionGateway } from "../application/session-gateway.js";
import type { WorkspaceContextReader } from "../application/workspace-context-reader.js";
import { OrganizationProfileError } from "../domain/organization-profile.js";

const organizationParams = z.object({
  organizationId: z.string().min(1),
});

export interface OrganizationRoutes {
  readonly sessions: SessionGateway;
  readonly workspace: WorkspaceContextReader;
  readonly executor: UseCaseExecutor;
  readonly completeProfile: CompleteOrganizationProfile;
  readonly getProfile: GetOrganizationProfile;
}

export function registerOrganizationRoutes(
  app: FastifyInstance,
  routes: OrganizationRoutes,
): void {
  app.get("/api/workspace/context", async (request, reply) => {
    try {
      const context = await routes.workspace.read(request.headers.cookie ?? "");
      if (!context) {
        return unauthenticated(reply);
      }

      const parsed = workspaceContextResponseSchema.safeParse(context);
      if (!parsed.success) {
        return internal(request, reply);
      }

      return parsed.data;
    } catch (error: unknown) {
      return sendFailure(request, reply, error);
    }
  });

  app.get(
    "/api/organizations/:organizationId/profile",
    async (request, reply) => {
      try {
        const organizationId = readOrganizationId(request);
        const context = await executionContext(
          request,
          organizationId,
          routes.sessions,
        );
        const profile = await routes.executor.execute(
          routes.getProfile,
          {},
          context,
        );
        if (!profile) {
          return reply.code(404).send({
            code: "not_found",
            message: "Organization profile was not found",
          });
        }

        return organizationProfileResponseSchema.parse({
          organizationId: profile.organizationId,
          legalName: profile.legalName,
          timezone: profile.timezone,
        });
      } catch (error: unknown) {
        return sendFailure(request, reply, error);
      }
    },
  );

  app.put(
    "/api/organizations/:organizationId/profile",
    async (request, reply) => {
      try {
        const organizationId = readOrganizationId(request);
        const context = await executionContext(
          request,
          organizationId,
          routes.sessions,
        );
        const parsed = completeOrganizationProfileRequestSchema.safeParse(
          request.body,
        );
        if (!parsed.success) {
          return reply.code(400).send({
            code: "validation",
            message: "The request is not valid",
          });
        }

        const profile = await routes.executor.execute(
          routes.completeProfile,
          parsed.data,
          context,
        );
        return organizationProfileResponseSchema.parse({
          organizationId: profile.organizationId,
          legalName: profile.legalName,
          timezone: profile.timezone,
        });
      } catch (error: unknown) {
        return sendFailure(request, reply, error);
      }
    },
  );
}

async function executionContext(
  request: FastifyRequest,
  organizationId: string,
  sessions: SessionGateway,
): Promise<ExecutionContext> {
  const session = await sessions.resolve({
    cookieHeader: request.headers.cookie ?? "",
  });
  if (!session) {
    throw new ApplicationError("unauthenticated", "Sign in to continue");
  }

  if (
    session.activeOrganizationId !== organizationId ||
    !session.memberOrganizationIds.includes(organizationId)
  ) {
    throw new ApplicationError("forbidden", "You cannot use this organization");
  }

  return {
    actorUserId: session.userId,
    organizationId,
    activeOrganizationId: session.activeOrganizationId,
    memberOrganizationIds: session.memberOrganizationIds,
    source: "request",
    headers: cookieHeaders(request.headers.cookie ?? ""),
  };
}

function readOrganizationId(request: FastifyRequest): string {
  const parsed = organizationParams.safeParse(request.params);
  if (!parsed.success) {
    throw new ApplicationError("validation", "The request is not valid");
  }

  return parsed.data.organizationId;
}

function unauthenticated(reply: FastifyReply) {
  return reply.code(401).send({
    code: "unauthenticated",
    message: "Sign in to continue",
  });
}

function internal(request: FastifyRequest, reply: FastifyReply) {
  request.log.warn({ name: "InternalError" }, "request failed");
  return reply.code(500).send({
    code: "internal",
    message: "Something went wrong",
  });
}

function sendFailure(
  request: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
) {
  if (error instanceof ApplicationError) {
    return reply.code(statusFor(error.code)).send({
      code: error.code,
      message: error.message,
    });
  }

  if (error instanceof OrganizationProfileError) {
    return reply.code(400).send({
      code: "validation",
      message: error.message,
    });
  }

  const name = error instanceof Error ? error.name : "UnknownError";
  request.log.warn({ name }, "request failed");
  return reply.code(500).send({
    code: "internal",
    message: "Something went wrong",
  });
}

function statusFor(code: ApplicationError["code"]): number {
  switch (code) {
    case "unauthenticated":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "conflict":
      return 409;
    case "validation":
      return 400;
  }
}
