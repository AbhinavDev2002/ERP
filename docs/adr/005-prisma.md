# ADR 005: Prisma

## Status

Accepted

## Decision

Prisma is the ORM and migration tool. `@prisma/client` is the query API. Prisma Migrate owns schema changes. The database client will live in `platform/database`. Each future module will own its models in a Prisma schema file under `apps/api/prisma/schema/`, using Prisma's multi-file schema. There are no models in this baseline.

This decision replaces the earlier Drizzle scaffold. The repository does not keep both ORMs.

## Consequences

- Domain code does not import `@prisma/client` or `prisma`.
- Application use cases do not call the Prisma client. Repositories in infrastructure do.
- Transaction boundaries stay with transaction behavior. The use case declares the need and does not open the transaction. Repositories use the transaction-scoped client.
- `prisma generate` runs before the API typecheck so the client exists. No migration is applied while the schema has no models.
