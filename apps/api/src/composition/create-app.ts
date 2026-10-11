import Fastify, { type FastifyInstance } from "fastify";

export type ReadinessChecks = {
  checkDatabase: () => Promise<void>;
  checkCache: () => Promise<void>;
};

export function createApp(
  checks: ReadinessChecks,
  options?: { logger?: boolean },
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

  return app;
}
