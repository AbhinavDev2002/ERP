# ADR 003: PostgreSQL

## Status

Accepted

## Decision

PostgreSQL is the system of record. Local development uses Docker Compose with PostgreSQL 17. The development database (`erp` on port 5432) and the test database (`erp_test` on port 5433) are separate servers and separate volumes.

## Consequences

- Integration tests can truncate or migrate the test database without touching development data.
- Production credentials are never stored in the repository or given to Cursor by default.
- Company scope, audit columns, and idempotency are future schema decisions and are not implied by this choice of database.
