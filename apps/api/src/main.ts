import pino from "pino";

import { AuthorizationBehavior } from "./core/execution/authorization-behavior.js";
import { TenantEnforcement } from "./core/execution/tenant-enforcement.js";
import { UseCaseExecutor } from "./core/execution/use-case-executor.js";
import { createApp } from "./composition/create-app.js";
import { CompleteOrganizationProfile } from "./modules/organization/application/complete-organization-profile.js";
import { GetOrganizationProfile } from "./modules/organization/application/get-organization-profile.js";
import { PrismaOrganizationAuditRepository } from "./modules/organization/infrastructure/prisma-organization-audit-repository.js";
import { PrismaOrganizationProfileRepository } from "./modules/organization/infrastructure/prisma-organization-profile-repository.js";
import { BetterAuthAuthorizationPolicy } from "./platform/auth/better-auth-authorization-policy.js";
import { BetterAuthSessionGateway } from "./platform/auth/better-auth-session-gateway.js";
import { BetterAuthWorkspaceReader } from "./platform/auth/better-auth-workspace-reader.js";
import { createAuth } from "./platform/auth/create-auth.js";
import { createCacheClient } from "./platform/cache/create-cache-client.js";
import { loadEnvironment } from "./platform/config/environment.js";
import { createPrismaClient } from "./platform/database/create-prisma-client.js";
import { createTenantPrismaClient } from "./platform/database/create-tenant-prisma-client.js";
import { PrismaTransactionRunner } from "./platform/database/prisma-transaction-runner.js";
import { SmtpEmailSender } from "./platform/email/smtp-email-sender.js";

async function main(): Promise<void> {
  const environment = loadEnvironment();
  const logger = pino({
    level: environment.NODE_ENV === "test" ? "silent" : "info",
  });
  const database = createPrismaClient();
  const tenantDatabase = createTenantPrismaClient(database);
  const cache = createCacheClient(environment.REDIS_URL);
  const emailSender = new SmtpEmailSender(
    { error: (message) => logger.error(message) },
    environment.SMTP_FROM,
    environment.SMTP_HOST,
    environment.SMTP_PORT,
  );
  const auth = createAuth({
    environment,
    database,
    cache,
    emailSender,
    logger: { error: (message) => logger.error(message) },
  });
  const profiles = new PrismaOrganizationProfileRepository(tenantDatabase);
  const audits = new PrismaOrganizationAuditRepository();
  const executor = new UseCaseExecutor(
    new TenantEnforcement(),
    new AuthorizationBehavior(new BetterAuthAuthorizationPolicy(auth)),
    new PrismaTransactionRunner(tenantDatabase),
  );
  let listening = false;
  const app = createApp(
    {
      checkDatabase: async () => {
        await database.$queryRaw`SELECT 1`;
      },
      checkCache: async () => {
        const response = await cache.ping();
        if (response !== "PONG") {
          throw new Error("Cache readiness failed");
        }
      },
    },
    {
      logger: true,
      runtime: {
        webOrigin: environment.WEB_ORIGIN,
        auth,
        sessions: new BetterAuthSessionGateway(auth, database),
        workspace: new BetterAuthWorkspaceReader(auth, database),
        executor,
        completeProfile: new CompleteOrganizationProfile(profiles, audits),
        getProfile: new GetOrganizationProfile(profiles),
      },
    },
  );

  const shutdown = async (): Promise<void> => {
    if (listening) {
      await app.close();
    }

    if (cache.isOpen) {
      await cache.quit();
    }

    await database.$disconnect();
  };

  process.once("SIGTERM", () => {
    void shutdown().then(() => {
      process.exit(0);
    });
  });
  process.once("SIGINT", () => {
    void shutdown().then(() => {
      process.exit(0);
    });
  });

  try {
    await cache.connect();
    await app.listen({ host: environment.HOST, port: environment.PORT });
    listening = true;
  } catch (error: unknown) {
    await shutdown();
    const name = error instanceof Error ? error.name : "UnknownError";
    logger.error(`API failed to start: ${name}`);
    process.exit(1);
  }
}

void main();
