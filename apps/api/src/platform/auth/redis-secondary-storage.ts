export interface RateLimitRedis {
  get(key: string): Promise<string | null>;
  getDel(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: { readonly EX: number; readonly NX?: true },
  ): Promise<string | null>;
  incr(key: string): Promise<number>;
  del(key: string): Promise<number>;
}

export interface SecondaryStorage {
  get: (key: string) => Promise<unknown>;
  getAndDelete: (key: string) => Promise<unknown>;
  increment: (key: string, ttl: number) => Promise<number>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export function createRedisSecondaryStorage(
  redis: RateLimitRedis,
): SecondaryStorage {
  return {
    async get(key) {
      return redis.get(key);
    },
    async getAndDelete(key) {
      return redis.getDel(key);
    },
    async increment(key, ttl) {
      await redis.set(key, "0", { EX: ttl, NX: true });
      return redis.incr(key);
    },
    async set(key, value, ttl) {
      if (ttl === undefined) {
        await redis.set(key, value);
        return;
      }

      await redis.set(key, value, { EX: ttl });
    },
    async delete(key) {
      await redis.del(key);
    },
  };
}
