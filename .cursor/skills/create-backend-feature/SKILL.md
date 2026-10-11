---
name: create-backend-feature
description: Create a backend business capability inside the modular monolith without bypassing layer boundaries.
---

# Create backend feature

When creating a backend business capability:

1. Read the architecture, backend, database, and API rules.
2. Search related existing modules and `@erp/contracts`.
3. Determine domain concepts.
4. Define required entities and value objects as classes in `domain/`.
5. Define each port as an `interface` in `domain/` or `application/`.
6. Implement each use case as a class whose constructor receives those ports. The class must not depend on Fastify or Prisma.
7. Implement infrastructure adapters and persistence under the feature's `infrastructure/`.
8. Implement HTTP schemas, controllers, and routes that only translate transport.
9. Add or update shared Zod contracts in `@erp/contracts` where the payload crosses the process boundary.
10. Construct concrete infrastructure classes only at the composition boundary and inject them through the port interfaces.
11. Add use-case tests.
12. Add repository integration tests against the test database when persistence changes.
13. Add HTTP integration tests when routes change.
14. Run lint, typecheck, architecture checks, and tests.
15. Review dependency boundaries. Domain must not import infrastructure, presentation, Fastify, or Prisma.

Do not bypass architecture to finish faster.

A use case declares whether it needs a transaction. It does not call `prisma.$transaction()`. Transaction behavior opens that transaction. Repositories use the transaction-scoped client. The first persistence feature must test that two repositories roll back together.
