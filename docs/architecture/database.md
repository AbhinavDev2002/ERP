# Database

PostgreSQL 17 is the system of record. Prisma is the ORM and migration tool.

## Local environments

`docker-compose.yml` runs one PostgreSQL 17 server:

| Service    | Port | Database   | Purpose     |
| ---------- | ---- | ---------- | ----------- |
| `postgres` | 5432 | `erp`      | Development |
| `postgres` | 5432 | `erp_test` | API tests   |

The local placeholder user and password are both `erp`. `.env.example` contains `DATABASE_URL` for host-side tools and `TEST_DATABASE_URL` for the test database. They are not production credentials. `.env` is gitignored.

Named volume `erp_postgres` stores the data directory. The service has a `pg_isready` health check.

Redis is also in Compose, as a cache. It is not a second system of record. See the service table in `README.md`.

Repository integration tests use `TEST_DATABASE_URL` and must not open `DATABASE_URL`. Compose creates `erp_test` on a new PostgreSQL volume.

## Ownership

`apps/api/prisma/schema` is a Prisma multi-file schema. `base.prisma` declares the PostgreSQL datasource and the Prisma Client generator. `auth.prisma` holds Better Auth identity tables. `organization.prisma` holds the organization profile and audit event.

When models are introduced:

- The process-wide database client belongs in `apps/api/src/platform/database`.
- A module owns its models in a Prisma schema file under `apps/api/prisma/schema/`, for example `customer.prisma`, using Prisma's multi-file schema. Migrations live in `apps/api/prisma/schema/migrations`.
- Repositories in that module's infrastructure use the client. Domain code does not import `@prisma/client`. Use cases do not call Prisma.

The repository uses Prisma only. Drizzle is not installed.

## Transactions

The use case declares whether it needs a transaction. Transaction behavior opens and commits it. Repositories must use the transaction-scoped Prisma client. A repository that calls a global client does not participate, even if the use case was wrapped in `prisma.$transaction()`.

Nested use cases join the active transaction. Business audit rows and outbox records that must be atomic with the change are written in that transaction. Publishing happens after commit.

Idempotency is a durable, concurrency-safe record with a request fingerprint. It is not a cache read followed by a later write.

Organization isolation is enforced in authorization and in persistence. Passing `organizationId` from a controller is not sufficient.

The first database-backed use case must include a test where two repositories share one transaction and rollback undoes both writes.

## Tenancy

Application tables use a shared database and shared schema. Each business row carries `organizationId`. Better Auth membership answers who may act. It does not filter business queries.

The Prisma client extension in `apps/api/src/platform/database` injects that organization id for tenant-scoped models and rejects a query that names a different organization. Repositories are the only callers of those models. Raw SQL, nested writes that omit the parent filter, and unchecked joins stay closed until a reviewed helper requires an `organizationId` predicate. The extension does not cover those paths.

PostgreSQL row-level security is deferred. It becomes the backstop once raw SQL or workers exist. Background jobs are not implemented. A future worker must pass an explicit organization id and must not reuse a browser session.

`companyId` and `branchId` are not part of this model yet. Do not add them until a business table needs a location below the organization.

Organization profile completion is the first persisted use case. It writes the profile and an audit row in one transaction. Audit rows store `organizationId` and `actorUserId`. Broader business change history (`approvedBy`, `postedBy`, `cancelledBy`) is still deferred.

Do not return raw database errors from HTTP handlers.
