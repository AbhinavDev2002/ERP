import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export interface AuthHandler {
  handler(request: Request): Promise<Response>;
}

export function registerAuthRoutes(
  app: FastifyInstance,
  auth: AuthHandler,
): void {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      try {
        await forwardAuthRequest(auth, request, reply);
      } catch (error: unknown) {
        const name = error instanceof Error ? error.name : "UnknownError";
        request.log.error({ name }, "auth request failed");
        return reply
          .code(500)
          .send({ code: "internal", message: "Something went wrong" });
      }
    },
  });
}

export async function forwardAuthRequest(
  auth: AuthHandler,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const forwarded = request.headers["x-forwarded-proto"];
  const protocol = forwarded === "https" ? "https" : "http";
  const url = new URL(
    request.url,
    `${protocol}://${request.headers.host ?? "localhost"}`,
  );
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    }
  }

  const body =
    request.method === "GET" ||
    request.method === "HEAD" ||
    request.body === undefined ||
    request.body === null
      ? undefined
      : JSON.stringify(request.body);
  const response = await auth.handler(
    new Request(url, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
    }),
  );

  reply.code(response.status);
  const cookies = response.headers.getSetCookie();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }
    reply.header(key, value);
  });
  if (cookies.length > 0) {
    reply.header("set-cookie", cookies);
  }

  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") && text.length > 0) {
    return reply.send(JSON.parse(text) as unknown);
  }

  return reply.send(text);
}
