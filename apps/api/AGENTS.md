# API instructions

`@erp/api` is a modular monolith. `src/main.ts` starts the process. `GET /health` checks PostgreSQL and Redis. Business modules are still added under `src/modules`.

Keep domain and application code framework-independent.

Never import Fastify, Prisma, PostgreSQL drivers, or HTTP concepts inside domain code.

Use controllers only for HTTP translation.

Use cases own application orchestration. They declare whether a transaction is required and do not open a Prisma transaction.

Repositories implement ports and use the transaction-scoped Prisma client. They must not keep a separate global client for work that belongs in that transaction.

Execution order is `docs/architecture/execution.md`: controller, executor, pipeline, use case, ports, repositories. The executor is not implemented in this factory.

Wire concrete dependencies at a composition boundary, not inside domain objects.

`src/core` is for future framework-independent concepts such as `Entity`, `AggregateRoot`, `DomainEvent`, `Result`, `Pagination`, and `ApplicationError`.

`src/platform` is for future technical capabilities such as database, logging, cache, events, configuration, and observability.

Do not add `helpers`, `misc`, or `utils` dumping grounds.

New business capabilities should normally be created inside `src/modules/<feature>` and should expose a public module API. Other modules must not deep-import `infrastructure`, `presentation`, or `internal` files.
