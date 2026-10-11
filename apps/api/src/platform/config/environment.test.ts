import { describe, expect, it } from "vitest";

import { loadEnvironment } from "./environment.js";

const validSource = {
  DATABASE_URL: "postgres://erp:erp@localhost:5432/erp",
  REDIS_URL: "redis://localhost:6379",
};

describe("loadEnvironment", () => {
  it("applies the local listen defaults", () => {
    expect(loadEnvironment(validSource)).toMatchObject({
      HOST: "0.0.0.0",
      PORT: 4000,
      DATABASE_URL: validSource.DATABASE_URL,
      REDIS_URL: validSource.REDIS_URL,
    });
  });

  it("rejects a database URL that is not PostgreSQL", () => {
    expect(() =>
      loadEnvironment({
        ...validSource,
        DATABASE_URL: "redis://localhost:6379",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("rejects a cache URL that is not Redis", () => {
    expect(() =>
      loadEnvironment({
        ...validSource,
        REDIS_URL: "postgres://erp:erp@localhost:5432/erp",
      }),
    ).toThrow(/REDIS_URL/);
  });
});
