# ADR 004: Fastify

## Status

Accepted

## Decision

The HTTP server is Fastify. Request and response validation uses Zod. Logging uses Pino.

## Consequences

- Fastify stays in the presentation layer. Domain and application code do not import it.
- Controllers translate HTTP. They do not own business rules.
- `apps/api/src/main.ts` starts the process. Business composition still arrives with the first feature. The only route today is `GET /health`.
