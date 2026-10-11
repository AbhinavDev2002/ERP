# Architecture overview

The ERP repository is a pnpm and Turborepo monorepo. Two applications share contracts and, later, UI.

```text
apps/web  ->  @erp/contracts
apps/api  ->  @erp/contracts
apps/web  ->  @erp/ui
```

`@erp/ui` and `@erp/contracts` do not depend on either application. The API does not depend on `@erp/ui`.

## Backend

`apps/api` is a modular monolith. Business code will live in `src/modules/<feature>` with this dependency direction:

```text
composition
    -> presentation
    -> application
    -> domain
```

Infrastructure sits beside the inward flow and implements ports declared by application or domain code. Domain code does not import Fastify, Prisma, PostgreSQL, HTTP, presentation, or infrastructure.

`src/core` will hold framework-independent building blocks such as `Entity`, `AggregateRoot`, `DomainEvent`, `Result`, `Pagination`, and `ApplicationError`. Those types are not implemented yet.

`src/platform` will hold technical capabilities such as the database client, logging, cache, event infrastructure, configuration, and observability. Those adapters are not implemented yet.

There is no `main.ts` and no business module in this baseline. The first real feature should establish the canonical module layout instead of copying an empty template full of placeholders.

## Frontend

`apps/web` uses the Next.js App Router and Material UI. See [frontend.md](frontend.md).

## Execution

Controllers will call a small executor. The executor runs pipeline behaviors and then the use case. That design is written in [execution.md](execution.md) and is not implemented.

## Shared contracts

Transport payloads that both sides must agree on belong in `@erp/contracts`. Domain entities do not. See [contracts.md](contracts.md).

## Decisions that are documented, not built

- Audit fields and business change history (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `approvedBy`, `postedBy`, `cancelledBy`)
- Organization scope (`organizationId`, `companyId`, `branchId`), which must be decided before many business tables exist
- Idempotency for retryable commands such as payments, invoice posting, stock movements, and webhooks

## Enforcement

Dependency-cruiser fails the build when a documented package or layer boundary is violated, including circular dependencies. Cursor rules explain the same boundaries. The cruiser rules are the mechanical check.
