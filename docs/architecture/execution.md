# Execution pipeline

This document describes the execution design. It is not implemented. There is no `UseCaseExecutor`, no behavior classes, and no Fastify entry point in this factory.

## Flow

```text
Fastify controller
    -> UseCaseExecutor
    -> ExecutionPipeline
    -> use case
    -> domain and ports
    -> Prisma repositories
```

The controller parses HTTP and calls the executor. It does not contain business rules.

The executor is small, typed, and transport-independent. It does not import Fastify and it does not perform the business operation. It runs the pipeline and then the use case.

The use case coordinates domain objects and ports. It does not open a Prisma transaction and it does not call `@prisma/client`.

## Pipeline behaviors

Each behavior has one job. A use case does not have to run every behavior. Order is fixed when a behavior is included, because authorization, idempotency, and transactions cannot be rearranged freely.

1. Logging
2. Tracing
3. Metrics
4. Tenant enforcement
5. Authorization
6. Idempotency
7. Transaction
8. Use case

Tenant enforcement and authorization run before the transaction. Idempotency is claimed before the transaction writes business data, and its completion record is finished in the same transaction as those writes.

## Transactions

The use case declares whether it needs a transaction. Transaction behavior opens and commits that transaction. Repositories receive the transaction-scoped Prisma client.

A repository that keeps its own global Prisma client does not join the transaction. Wrapping the use case in `prisma.$transaction()` is not enough when repositories ignore the client passed into them.

Nested use cases join the active transaction. They do not open a second one.

The first database-backed use case must include a test where two repositories share one transaction and a rollback undoes both writes.

## Idempotency

Idempotency is a durable record keyed by the idempotency key and a fingerprint of the request. Two concurrent requests with the same key must not both pass a read-before-write check. Completion is stored in the same transaction as the business write. A result is returned only after that transaction commits.

This is not an in-memory cache and not a check-then-set without a lock or unique constraint.

## Organization isolation

A controller argument named `organizationId` is not authorization. Tenant enforcement and authorization decide whether the caller may act in that organization. Persistence queries are scoped to that organization so a resource from another organization is not readable or writable.

## Audit and events

Technical execution logs belong to the logging behavior.

Business audit rows and outbox records that must succeed or fail with the business change are written in the same transaction. External publishing runs after commit, from a separate outbox publisher. The publisher is not part of this factory.
