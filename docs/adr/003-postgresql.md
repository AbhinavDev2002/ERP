# ADR 003: PostgreSQL

## Status

Accepted

## Decision

PostgreSQL is the system of record. Local development uses Docker Compose with one PostgreSQL 17 server: database `erp` on port 5432.

A separate test database is deferred. Repository tests must not use `DATABASE_URL` until that database exists again.

## Consequences

- Local Compose has a single database URL.
- Integration tests are not run against the development database.
- Production credentials are never stored in the repository or given to Cursor by default.
- Company scope, audit columns, and idempotency are future schema decisions and are not implied by this choice of database.
