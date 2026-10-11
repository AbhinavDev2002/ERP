# Backend architecture

`@erp/api` is a Node.js modular monolith. Fastify, Zod, Pino, Prisma, and PostgreSQL are the chosen platform. None of that stack is allowed to leak into the domain.

## Layers

```text
presentation -> application -> domain
```

- Presentation parses HTTP, calls a use case, and maps the result to a response.
- Application use cases coordinate entities and ports. They do not read Fastify requests or call the Prisma client.
- Domain holds entities, value objects, domain events, and domain errors. It depends only on language and its own types.

Infrastructure implements the ports. It may use Prisma and `pg`. The composition root is the only place that constructs repositories, use cases, and route registrars and connects them.

## Module shape

A future feature module should look like this:

```text
apps/api/src/modules/<feature>/
├── domain/
├── application/
├── infrastructure/
├── presentation/
├── <feature>.module.ts
└── index.ts
```

`<feature>.module.ts` wires repositories, use cases, and routes. `index.ts` is the only public API. Other modules import that entry, not `infrastructure/*`, `presentation/*`, or other internal files. Cross-module work goes through that public API, an application port, or a domain or application event.

Keep modules in `apps/api/src/modules/`. Do not extract them into `packages/modules` until a module is isolated and there is a concrete reason to reuse or deploy it separately.

## core and platform

`src/core` is for abstractions that would still make sense if Fastify and Prisma were replaced: entities, aggregate roots, domain events, results, pagination, and application errors.

`src/platform` is for process-wide technical services: database connection, logging, cache, messaging, configuration, and observability. Configuration, the Prisma client, and the Redis client are in place. Logging adapters, messaging, and observability are not.

Do not create `helpers`, `misc`, `common`, or `utils` folders for unrelated leftovers. A shared file needs one cohesive reason to exist.

## Transactions

The use case declares whether it needs a transaction. It does not open one. Transaction behavior opens and commits it. Repositories use the transaction-scoped Prisma client. Nested use cases join that transaction.

The full pipeline, idempotency, tenant enforcement, and outbox rules are in [execution.md](execution.md).

## What this baseline contains

`src/modules`, `src/core`, and `src/platform` are empty. Prisma is configured with a PostgreSQL datasource and no models. There is no HTTP server.
