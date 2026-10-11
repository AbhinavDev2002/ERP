# ADR 004: Fastify

## Status

Accepted

## Decision

The HTTP server is Fastify. Request and response validation uses Zod. Logging uses Pino.

## Consequences

- Fastify stays in the presentation layer. Domain and application code do not import it.
- Controllers translate HTTP. They do not own business rules.
- There is no server entry in the factory baseline. The first feature will introduce composition and process startup together.
