import { createApp } from "./composition/create-app.js";
import { createCacheClient } from "./platform/cache/create-cache-client.js";
import { loadEnvironment } from "./platform/config/environment.js";
import { createPrismaClient } from "./platform/database/create-prisma-client.js";

async function main(): Promise<void> {
  const environment = loadEnvironment();
  const database = createPrismaClient();
  const cache = createCacheClient(environment.REDIS_URL);
  let listening = false;
  const app = createApp({
    checkDatabase: async () => {
      await database.$queryRaw`SELECT 1`;
    },
    checkCache: async () => {
      const response = await cache.ping();

      if (response !== "PONG") {
        throw new Error("Cache readiness failed");
      }
    },
  });

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
    console.error(`API failed to start: ${name}`);
    process.exit(1);
  }
}

void main();
