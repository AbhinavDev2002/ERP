import cors from "@fastify/cors";
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";

import type { AuthHandler } from "../platform/auth/register-auth-routes.js";
import { registerAuthRoutes } from "../platform/auth/register-auth-routes.js";
import {
  registerOrganizationRoutes,
  type OrganizationRoutes,
} from "../modules/organization/presentation/register-organization-routes.js";

export type ReadinessChecks = {
  checkDatabase: () => Promise<void>;
  checkCache: () => Promise<void>;
};

export interface AppRuntime extends OrganizationRoutes {
  readonly webOrigin: string;
  readonly auth: AuthHandler;
}

export function createApp(
  checks: ReadinessChecks,
  options?: { logger?: FastifyServerOptions["logger"]; runtime?: AppRuntime },
): FastifyInstance {
  const app = Fastify({ logger: options?.logger ?? true });

  app.get("/health", async (_request, reply) => {
    try {
      await checks.checkDatabase();
      await checks.checkCache();
      return { status: "ok" };
    } catch {
      app.log.warn("readiness check failed");
      return reply.code(503).send({ status: "unavailable" });
    }
  });

  const runtime = options?.runtime;
  if (runtime) {
    void app.register(cors, {
      origin: runtime.webOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    });
    registerAuthRoutes(app, runtime.auth);
    registerOrganizationRoutes(app, runtime);
  }

  return app;
}
