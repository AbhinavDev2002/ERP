# Database

PostgreSQL 17 is the system of record. Prisma is the ORM and migration tool.

## Local environments

`docker-compose.yml` runs two isolated servers:

| Service         | Port | Database   | Purpose         |
| --------------- | ---- | ---------- | --------------- |
| `postgres`      | 5432 | `erp`      | Development     |
| `postgres-test` | 5433 | `erp_test` | Automated tests |

Both use the local placeholder user and password `erp`. Those values are in `.env.example` as `DATABASE_URL` and `TEST_DATABASE_URL`. They are not production credentials. `.env` is gitignored.

Named volumes `erp_postgres` and `erp_postgres_test` keep the two data directories separate. Each service has a `pg_isready` health check.

## Ownership

`apps/api/prisma/schema.prisma` declares the PostgreSQL datasource and the Prisma Client generator. It has no models, so there is nothing to migrate.

When models are introduced:

- The process-wide database client belongs in `apps/api/src/platform/database`.
- A module owns its models in a Prisma schema file under `apps/api/prisma/schema/`, for example `customer.prisma`, using Prisma's multi-file schema.
- Repositories in that module's infrastructure use the client. Domain code does not import `@prisma/client`. Use cases do not call Prisma.

The repository uses Prisma only. Drizzle is not installed.

## Transactions

The use case declares whether it needs a transaction. Transaction behavior opens and commits it. Repositories must use the transaction-scoped Prisma client. A repository that calls a global client does not participate, even if the use case was wrapped in `prisma.$transaction()`.

Nested use cases join the active transaction. Business audit rows and outbox records that must be atomic with the change are written in that transaction. Publishing happens after commit.

Idempotency is a durable, concurrency-safe record with a request fingerprint. It is not a cache read followed by a later write.

Organization isolation is enforced in authorization and in persistence. Passing `organizationId` from a controller is not sufficient.

The first database-backed use case must include a test where two repositories share one transaction and rollback undoes both writes.

## Not decided yet

Do not add these columns until the model is chosen:

- Audit: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `approvedBy`, `postedBy`, `cancelledBy`, plus a place for meaningful business change history
- Scope: `organizationId`, `companyId`, `branchId`

Choose the company and tenancy model before creating a large set of business tables. Retryable side effects such as payments, posting, stock movement, and webhooks may later need idempotency keys. That mechanism is not part of this baseline.

Do not return raw database errors from HTTP handlers.
