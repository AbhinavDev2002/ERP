import Fastify from "fastify";
import { describe, expect, it } from "vitest";

import { forwardAuthRequest } from "./register-auth-routes.js";

describe("forwardAuthRequest", () => {
  it("copies every set-cookie header from the auth response", async () => {
    const app = Fastify({ logger: false });
    app.post("/api/auth/sign-in", async (request, reply) => {
      await forwardAuthRequest(
        {
          handler: async () => {
            const headers = new Headers({ "content-type": "application/json" });
            headers.append(
              "set-cookie",
              "better-auth.session_token=one; HttpOnly",
            );
            headers.append(
              "set-cookie",
              "better-auth.session_data=two; HttpOnly",
            );
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers,
            });
          },
        },
        request,
        reply,
      );
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: "owner@example.com" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    const cookies = response.headers["set-cookie"];
    expect(cookies).toEqual([
      "better-auth.session_token=one; HttpOnly",
      "better-auth.session_data=two; HttpOnly",
    ]);
    await app.close();
  });
});
