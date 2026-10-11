import { createClient, type RedisClientType } from "redis";

export function createCacheClient(url: string): RedisClientType {
  const client = createClient({
    url,
    socket: {
      reconnectStrategy: () => new Error("Redis unavailable"),
    },
  });

  client.on("error", () => {
    // Connection failures are reported by connect() and readiness checks.
  });

  return client;
}
