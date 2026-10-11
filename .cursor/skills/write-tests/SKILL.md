---
name: write-tests
description: Add backend and frontend tests that exercise real boundaries instead of mocking the whole system.
---

# Write tests

Match the test to the boundary under change.

Backend:

- Use-case tests drive application logic through ports. In-memory fakes are appropriate here.
- Repository tests run against the PostgreSQL test database (`TEST_DATABASE_URL`). Do not mock Prisma for these tests.
- HTTP tests exercise routing, validation, and response mapping through the application.

Frontend:

- Use Vitest and React Testing Library for component and hook behavior that is worth locking in.
- Use Playwright for end-to-end flows. Playwright does not replace use-case or repository tests.

Do not mock every dependency. A test that only asserts a mock was called does not prove the behavior.

Keep the test database separate from the development database.

After adding tests, run the relevant test command, lint, and typecheck.
