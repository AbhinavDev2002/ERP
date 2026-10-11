# Gaps against the consolidated ERP blueprint

This note compares the repository as it exists with the consolidated blueprint. Prisma is the ORM. The blueprint's `drizzle.config.ts` line is not a gap.

The repository is still a factory. Folders below are empty unless a file is named.

## Already aligned

- pnpm workspaces and Turborepo
- Next.js 16, React 19, TypeScript, App Router
- Material UI and Emotion live in `@erp/ui`. `apps/web` does not depend on `@mui/*` or `@emotion/*`
- TanStack Query, React Hook Form, and Zod are installed on `@erp/web`
- Fastify, Zod, and Pino are installed on `@erp/api`
- PostgreSQL 17 in Docker, with a separate test database
- Prisma schema at `apps/api/prisma/schema.prisma`, with no models
- Packages `@erp/contracts`, `@erp/ui`, `@erp/eslint-config`, `@erp/typescript-config`, `@erp/test-utils`
- Empty `apps/web/src/features`, `widgets`, and `shared` (`api`, `auth`, `config`, `forms`, `hooks`, `lib`, `query`)
- Empty `apps/api/src/modules`, `core`, and `platform`
- Empty `@erp/ui` folders `theme`, `primitives`, `layout`, `patterns`
- Vitest on the API, Playwright config, dependency-cruiser
- Inward backend layering is written in the rules: presentation, application, domain, with infrastructure behind ports
- Documented feature shape is `api/`, `components/`, `forms/`, `hooks/`, `lib/`, `screens/`, and `index.ts`. `app/**/page.tsx` is the route entry
- Documented future routes are `app/(public)`, `app/(auth)`, and `app/(workspace)/[organizationId]/...`
- State rules use TanStack Query, URL state, React Hook Form, and `useState` or `useReducer`. `useEffect` is only for synchronizing with an external system
- The execution design is documented in `docs/architecture/execution.md`: controller, executor, pipeline, use case, ports, repositories
- The use case declares a transaction. Transaction behavior opens it. Repositories use the transaction-scoped Prisma client
- A module's public API is `index.ts`. Composition is `<feature>.module.ts`. Modules stay in `apps/api/src/modules/`

## Frontend that is documented and not built

| Blueprint                                                            | This repo                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `app/(public)`, `app/(auth)`, `app/(workspace)/[organizationId]/...` | Only the Next.js starter `app/layout.tsx` and `app/page.tsx`      |
| `app/providers.tsx`                                                  | `src/providers/` exists and is empty. There is no `providers.tsx` |
| Widgets `app-sidebar`, `workspace-header`, `organization-switcher`   | `src/widgets/` is one empty folder                                |
| `shared/api/browser-client.ts`, `server-client.ts`, `api-error.ts`   | `shared/api/` is empty                                            |
| `shared/query` QueryClient setup                                     | `shared/query/` is empty. No provider                             |

No feature directory has been created (`customers`, `invoices`, `inventory`, `organizations`, `auth`).

## Backend that is documented and not built

| Blueprint                                                                                           | This repo                                                        |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/bootstrap/`, `src/app.ts`, `src/main.ts`                                                       | Not present. `pnpm dev` starts only Next.js                      |
| `modules/<feature>/` with domain, application, infrastructure, presentation                         | `src/modules/` is empty. The layout is documented, not created   |
| UseCaseExecutor and pipeline behaviors                                                              | Documented in `docs/architecture/execution.md`. No classes exist |
| Transaction-scoped repositories                                                                     | Documented. No repository code exists                            |
| Modules for identity, organizations, accounting, inventory, CRM, procurement, orders, analytics, AI | Not present                                                      |

`core/` and `platform/` exist and are empty. They do not yet hold an executor, logger, or database client.

## Shared packages that are not filled in

| Blueprint                                                         | This repo                                                                    |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `@erp/contracts/src/common`, `customers`, `invoices`, `inventory` | Only `src/common/` and `src/index.ts` (`export {}`)                          |
| `@erp/ui` theme, primitives, layout, patterns as real components  | Directories exist. `src/index.ts` is `export {}`. No theme and no components |
| `@erp/test-utils` fixtures and helpers                            | `src/index.ts` is `export {}`                                                |
| Later `packages/modules/*` extracted from the API                 | Not started. Current rule is to keep modules in `apps/api/src/modules/`      |

## Testing that is not in place

| Blueprint                                             | This repo                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Domain and use-case Vitest tests                      | Vitest is configured with `passWithNoTests`. There are no tests                                 |
| Repository tests against PostgreSQL                   | Test database is defined. No repository tests                                                   |
| Shared-transaction rollback proof                     | Required for the first persistence feature. Not written                                         |
| Fastify `inject` HTTP tests                           | No app factory to inject                                                                        |
| Vitest, React Testing Library, and MSW on the web app | Not installed                                                                                   |
| Playwright journeys under `e2e/`                      | Config points at `e2e/`. That directory does not exist. Playwright is not part of `pnpm verify` |
| dependency-cruiser                                    | Present, including a ban on `apps/web` importing Material UI                                    |

## Platform pieces named in the blueprint and absent here

These are not in Docker Compose, package manifests, or source:

- Redis
- BullMQ and workers
- SSE or WebSockets
- AWS deployment manifests
- AI, RAG, or agent-tool packages

Docker Compose only runs the development Postgres and the test Postgres.

## What this comparison does not treat as a gap

The blueprint still names Drizzle and `drizzle.config.ts`. This repository uses Prisma, `apps/api/prisma/schema.prisma`, and `@prisma/client`. That is the accepted ORM. Do not add Drizzle back.
