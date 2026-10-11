import { describe, expect, it } from "vitest";

import { createApp, type ReadinessChecks } from "./create-app.js";

const ready: ReadinessChecks = {
  checkDatabase: async () => undefined,
  checkCache: async () => undefined,
};

describe("GET /health", () => {
  it("reports ok when PostgreSQL and Redis answer", async () => {
    const app = createApp(ready, { logger: false });
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    await app.close();
  });

  it("reports unavailable when a dependency check fails", async () => {
    const app = createApp(
      {
        ...ready,
        checkCache: async () => {
          throw new Error("cache down");
        },
      },
      { logger: false },
    );
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: "unavailable" });
    await app.close();
  });
});
