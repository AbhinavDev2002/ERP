# ERP repository

This repository is a TypeScript ERP monorepo. It is the engineering factory for later business modules. It does not yet contain ERP behavior.

## Applications

- `@erp/api` (`apps/api`): Node.js backend. Fastify, Zod, Pino, PostgreSQL, Prisma, and Redis are installed. `src/main.ts` listens and exposes `GET /health`.
- `@erp/web` (`apps/web`): Next.js App Router frontend. Material UI is the design-system foundation. Tailwind is not used.

## Shared packages

- `@erp/contracts`: Zod transport contracts. Types should be inferred with `z.infer`.
- `@erp/ui`: future ERP theme, primitives, layout, and patterns on top of MUI.
- `@erp/typescript-config`: shared strict TypeScript configuration.
- `@erp/eslint-config`: shared ESLint configuration.
- `@erp/test-utils`: shared test helpers. Empty in this baseline.

Packages are consumed from source. Do not deep-import package internals.

## Backend architecture

The backend is a feature-oriented modular monolith.

```text
composition -> presentation -> application -> domain
```

Infrastructure implements application and domain ports. `core/` holds future framework-independent abstractions. `platform/` holds future technical capabilities such as the database client and logging.

## Frontend architecture

```text
MUI -> ERP theme -> primitives -> layout -> patterns -> feature components -> routes
```

Generic UI belongs in `@erp/ui`. Feature UI belongs in `apps/web/src/features`. Pages compose features.

## Tooling

Requirements: Node.js 22.17.0 or newer (see `.nvmrc`) and pnpm 10.15.1 (`packageManager`).

On this Windows machine, Corepack's default pnpm shim failed until `corepack prepare pnpm@10.15.1 --activate`. Use that command if `pnpm` cannot start. The repo still uses Corepack; it does not rely on a globally installed pnpm binary.

```bash
pnpm install
docker compose up -d
pnpm dev
pnpm verify
```

`pnpm verify` runs format check, lint, typecheck, dependency-cruiser, tests, and build.

Playwright is configured in `playwright.config.ts`. It is not part of `pnpm verify` until end-to-end specs exist, because Playwright exits with an error when it finds no tests. Install browsers with `pnpm exec playwright install` before the first end-to-end run.

## Local services

`docker compose up -d --build` from the repository root starts:

| Service    | Address          | Role                                      |
| ---------- | ---------------- | ----------------------------------------- |
| `postgres` | `127.0.0.1:5432` | PostgreSQL 17 database `erp`              |
| `redis`    | `127.0.0.1:6379` | Cache. Evicts with `allkeys-lru`. No disk |
| `api`      | `127.0.0.1:4000` | `@erp/api`, health at `/health`           |
| `web`      | `127.0.0.1:3000` | `@erp/web`                                |

There is one database URL. A separate test database is not part of Compose yet. Do not point tests at the development database.

Copy `.env.example` to `.env` when running the apps on the host with `pnpm dev` and `pnpm --filter @erp/api start`. Those host URLs use `localhost`. Compose replaces them with the `postgres` and `redis` service names inside the containers. The credentials are local placeholders, not production secrets.

## Cursor

Rules, skills, and agents live under `.cursor/`. MCP entries for GitHub, local Postgres, and Playwright read environment variables. Application scripts do not depend on MCP. Do not point MCP at a production database.

## Before implementing

Search the existing codebase and the architecture docs for the canonical pattern. Reuse it instead of inventing a new structure.

## Required verification

Before considering work complete:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm arch`
5. `pnpm test`
6. `pnpm build`

`pnpm verify` runs those steps in that order.
