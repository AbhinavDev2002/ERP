---
name: review-feature
description: Review a feature for architecture boundaries, Material UI reuse, contracts, and tests before calling it done.
---

# Review feature

Review the change against the repository rules before treating it as complete.

Check:

- Domain does not import Fastify, Prisma, HTTP, infrastructure, or presentation.
- Use cases do not call the Prisma client or read HTTP request objects.
- Controllers do not contain business rules.
- Cross-module and cross-feature imports use public APIs.
- Transport schemas live in `@erp/contracts` and types are inferred with `z.infer`.
- `@erp/ui` does not import either application, and the API does not import `@erp/ui`.
- Material UI is the only UI framework. Tailwind and shadcn/ui are absent.
- New generic UI was not added when MUI or `@erp/ui` already covers it.
- Theme tokens and MUI spacing or breakpoints are preferred over hardcoded visual values.
- Server state uses TanStack Query. Forms use React Hook Form.
- Tests cover the use case, persistence, and HTTP boundary that the change actually touched.
- Lint, typecheck, architecture validation, and the relevant tests were run.

Do not approve a shortcut that weakens TypeScript, lint, or dependency rules.
