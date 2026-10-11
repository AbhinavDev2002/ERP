# Testing

The factory configures test runners and does not include product behavior tests.

## Backend

Vitest is configured in `apps/api` with `passWithNoTests`. Future backend coverage should be three layers:

1. Use-case tests, with in-memory ports where the behavior under test is application logic.
2. Repository integration tests against a real PostgreSQL test database. That database is not in Compose yet. Do not point these tests at `DATABASE_URL`.
3. HTTP integration tests through Fastify, covering validation and response mapping.

Do not mock the database for repository or HTTP integration tests. Do not point those tests at the development database.

The first database-backed use case must prove that two repositories share one transaction and that rollback undoes both writes.

## Frontend

When the first feature exists, colocate its tests with that feature. Use Vitest and React Testing Library for components and forms, and MSW for feature flows that talk to the API. Those libraries are not installed in this baseline because there is no feature UI yet.

Playwright remains the tool for full browser journeys. It does not replace component tests.

## End to end

Playwright is installed at the repository root. `playwright.config.ts` targets `e2e/` and `http://127.0.0.1:3000`. No specs are included. `pnpm verify` does not run Playwright, because a run with zero tests fails. When the first spec exists, add it to the verification pipeline and install browsers with `pnpm exec playwright install`.

## Shared helpers

`@erp/test-utils` exists so later tests can share setup without copying it into each app. It exports nothing today. Do not put product fixtures there in advance.

## What a green run does not prove

Lint, typecheck, dependency-cruiser, and tests answer different questions. Passing tests do not excuse a domain import of Prisma or a duplicated contract type.
