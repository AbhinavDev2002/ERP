import { describe, expect, it } from "vitest";

import {
  createRedisSecondaryStorage,
  type RateLimitRedis,
} from "./redis-secondary-storage.js";

describe("createRedisSecondaryStorage", () => {
  it("increments an existing counter without replacing its value", async () => {
    const redis = new MemoryRedis();
    const storage = createRedisSecondaryStorage(redis);

    await storage.set("otp", "secret-code", 30);
    expect(await storage.increment("limit", 600)).toBe(1);
    expect(await storage.increment("limit", 600)).toBe(2);
    expect(redis.values.get("otp")).toBe("secret-code");
    expect(await storage.getAndDelete("otp")).toBe("secret-code");
    expect(await storage.get("otp")).toBeNull();
  });
});

class MemoryRedis implements RateLimitRedis {
  readonly values = new Map<string, string>();
  readonly expiryWrites: string[] = [];

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async getDel(key: string): Promise<string | null> {
    const value = this.values.get(key) ?? null;
    this.values.delete(key);
    return value;
  }

  async set(
    key: string,
    value: string,
    options?: { readonly EX: number; readonly NX?: true },
  ): Promise<string | null> {
    if (options?.NX && this.values.has(key)) {
      return null;
    }

    this.values.set(key, value);
    if (options?.EX !== undefined) {
      this.expiryWrites.push(key);
    }
    return "OK";
  }

  async incr(key: string): Promise<number> {
    const next = Number(this.values.get(key) ?? "0") + 1;
    this.values.set(key, String(next));
    return next;
  }

  async del(key: string): Promise<number> {
    return this.values.delete(key) ? 1 : 0;
  }
}
