# ADR 006: Shared contracts

## Status

Accepted

## Decision

`@erp/contracts` holds shared transport schemas. The package is consumed from source through its public export. It does not contain domain entities, repository ports, or Prisma records.

## Consequences

- Frontend and backend import the same Zod schemas and infer types with `z.infer`.
- The contracts package cannot import `apps/web` or `apps/api`, so it cannot become a shortcut back into application code.
- Deep imports of contract internals are not part of the public API.
