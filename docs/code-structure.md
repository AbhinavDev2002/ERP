# ERP code structure

This document describes the repository as it exists after the factory bootstrap. It is a map of folders, packages, tooling, and the rules those folders are reserved for.

The baseline contains structure, configuration, and guidance. It does not contain ERP business behavior: no domain entities, use cases, repositories, HTTP routes, database tables, shared Zod contracts, Material UI theme, design-system components, feature screens, or Fastify server entry.

Package manager: pnpm `10.15.1`. Node.js: `22.17.0` or newer (`.nvmrc`).

## How the pieces fit

```text
apps/web  ----imports---->  @erp/contracts
apps/api  ----imports---->  @erp/contracts
apps/web  ----imports---->  @erp/ui

@erp/ui          does not import apps/web or apps/api
@erp/contracts   does not import apps/web or apps/api
apps/api         does not import @erp/ui
```

Shared packages are consumed from TypeScript source through a single public export. There is no per-package build output. Application code imports `@erp/contracts` and `@erp/ui`, not files inside `src/`.

Backend layers, once a feature exists, flow inward:

```text
composition
    -> presentation
    -> application
    -> domain
```

Infrastructure implements ports declared by application or domain code. It does not sit above the domain.

Frontend layers, once UI exists, stack like this:

```text
MUI
 -> ERP theme          packages/ui/src/theme
 -> primitives         packages/ui/src/primitives
 -> layout             packages/ui/src/layout
 -> patterns           packages/ui/src/patterns
 -> feature components apps/web/src/features/<feature>
 -> routes             apps/web/src/app
```

## Repository tree

```text
ERP/
├── apps/
│   ├── api/                          @erp/api
│   │   ├── src/
│   │   │   ├── modules/              future business modules
│   │   │   ├── core/                 future framework-independent abstractions
│   │   │   └── platform/             future technical adapters
│   │   ├── prisma/
│   │   │   └── schema.prisma         PostgreSQL datasource, no models
│   │   ├── AGENTS.md
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── web/                          @erp/web
│       ├── src/
│       │   ├── app/                  Next.js routes (scaffold only)
│       │   ├── features/             future feature UI, empty
│       │   ├── providers/            empty
│       │   ├── shared/               web infrastructure, empty
│       │   │   ├── api/
│       │   │   ├── auth/
│       │   │   ├── config/
│       │   │   ├── forms/
│       │   │   ├── hooks/
│       │   │   ├── lib/
│       │   │   └── query/
│       │   └── widgets/              application shell, empty
│       ├── AGENTS.md
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── next-env.d.ts
│       ├── package.json
│       ├── README.md
│       └── tsconfig.json
├── packages/
│   ├── contracts/                    @erp/contracts
│   │   └── src/
│   │       ├── common/               future cross-cutting transport schemas
│   │       └── index.ts              export {}
│   ├── ui/                           @erp/ui
│   │   └── src/
│   │       ├── primitives/
│   │       ├── layout/
│   │       ├── patterns/
│   │       ├── theme/
│   │       └── index.ts              export {}
│   ├── eslint-config/                @erp/eslint-config
│   ├── typescript-config/            @erp/typescript-config
│   └── test-utils/                   @erp/test-utils
├── docs/
│   ├── architecture/
│   ├── adr/
│   └── code-structure.md             this file
├── tooling/                          reserved, empty
├── .cursor/
│   ├── rules/
│   ├── skills/
│   ├── agents/
│   ├── hooks.json
│   └── mcp.json
├── AGENTS.md
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── playwright.config.ts
├── .dependency-cruiser.cjs
├── .env.example
├── .nvmrc
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .prettierrc.json
└── README.md
```

Empty directories are kept with `.gitkeep` so Git tracks the layout. `node_modules`, `pnpm-lock.yaml`, and `.next` exist after install and build. They are generated.

## Root workspace

`package.json` is private and named `erp`. It declares:

- `packageManager`: `pnpm@10.15.1`
- `engines`: Node `>=22.17.0`, pnpm `>=10.15.1`
- `pnpm.onlyBuiltDependencies`: `prisma`, `@prisma/client`, `@prisma/engines`, `esbuild`, `sharp`, and `unrs-resolver` so pnpm 10 is allowed to run those install scripts

`pnpm-workspace.yaml` includes `apps/*` and `packages/*`. The root package is the workspace root. `tooling/` is a normal folder, not a workspace package.

### Scripts

| Script              | What it runs                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`          | `turbo dev`. Persistent and uncached. Only `@erp/web` defines `dev` (`next dev`).                                                 |
| `pnpm build`        | `turbo build`. Depends on `^build`. Outputs are `.next/**` except the Next cache. Only `@erp/web` defines `build` (`next build`). |
| `pnpm lint`         | `turbo lint`, which runs ESLint in each package that has a `lint` script.                                                         |
| `pnpm typecheck`    | `turbo typecheck`. Each package runs `tsc --noEmit`. Web runs `next typegen` first so typed routes exist.                         |
| `pnpm test`         | `turbo test`. Only `@erp/api` defines `test` (`vitest run`).                                                                      |
| `pnpm format`       | Prettier write across the repo.                                                                                                   |
| `pnpm format:check` | Prettier check.                                                                                                                   |
| `pnpm arch`         | dependency-cruiser over `apps` and `packages`.                                                                                    |
| `pnpm verify`       | format check, lint, typecheck, architecture, tests, then build.                                                                   |

Turbo task edges:

- `dev` is persistent and not cached.
- `build` depends on upstream `build` tasks and records `.next` output.
- `lint`, `typecheck`, and `test` depend on the same task in workspace dependencies (`^lint`, `^typecheck`, `^test`).

Shared packages do not define `build`. They are imported as `.ts` source. `@erp/api` also has no `build` script. Its check is `typecheck`. A `tsc --noEmit` build script made Turbo warn that the task produced no files, so it was left off.

### Root TypeScript

`tsconfig.json` extends `packages/typescript-config/base.json`, sets `noEmit`, and includes no files. App and package configs extend the shared base themselves. The root file exists so the strict baseline has one home and so editors opening the repo root resolve the same flags.

### Editor and line endings

- `.nvmrc` is `22.17.0`.
- `.editorconfig` uses UTF-8, LF, two-space indent, a final newline, and trimmed trailing whitespace. Markdown keeps trailing double spaces.
- `.gitattributes` marks text as LF and common image and font files as binary.
- `.prettierrc.json` sets `endOfLine` to `lf`.
- `.prettierignore` skips `node_modules`, build output, coverage, Playwright output, Turbo cache, and lockfiles.
- `.gitignore` ignores dependencies, `.env` (except `.env.example`), `.next`, `dist`, coverage, Playwright reports, and Turbo cache.

## Strict TypeScript

`packages/typescript-config/base.json` is the shared compiler baseline. Every app and shared TypeScript package extends it. The package exports that file as `@erp/typescript-config/base.json`.

Enabled flags:

- `strict`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noImplicitOverride`
- `noFallthroughCasesInSwitch`
- `useUnknownInCatchVariables`
- `noImplicitReturns`
- `forceConsistentCasingInFileNames`
- `verbatimModuleSyntax`
- `isolatedModules`
- `skipLibCheck`

These flags are not relaxed to make generated Next.js code compile. `any` and `@ts-ignore` are lint errors. `@ts-expect-error` is allowed only with a description of at least 10 characters.

Each package then adds the module settings it needs:

| Project                             | Module settings                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `@erp/api`                          | `NodeNext`, `types: ["node"]`, includes `src` and `vitest.config.ts`                                        |
| `@erp/web`                          | Next.js settings: `jsx: react-jsx`, `moduleResolution: bundler`, path alias `@/*` to `./src/*`, Next plugin |
| `@erp/contracts`, `@erp/test-utils` | `ESNext` + `Bundler`, `noEmit`                                                                              |
| `@erp/ui`                           | same, plus `jsx: react-jsx` and the DOM lib, ready for later components                                     |

`verbatimModuleSyntax` means type-only imports must use `import type`. `exactOptionalPropertyTypes` means an optional property cannot be set to `undefined` unless the type says so.

## ESLint

`@erp/eslint-config` exports a flat config from `packages/eslint-config/index.js`:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `@typescript-eslint/no-explicit-any` as an error
- `@typescript-eslint/ban-ts-comment` with `ts-ignore` banned

Consumers:

- `apps/api/eslint.config.js`
- `packages/contracts/eslint.config.js`
- `packages/ui/eslint.config.js`
- `packages/test-utils/eslint.config.js`
- `apps/web/eslint.config.mjs`, which also spreads `eslint-config-next` core web vitals and TypeScript, and ignores `.next`, `out`, `build`, and `next-env.d.ts`

`@erp/eslint-config` itself has no `lint` script. The apps and the other shared packages lint their own trees.

## `@erp/api`

Node backend package. Runtime libraries are installed and unused by application code:

| Dependency       | Role it will play                                             |
| ---------------- | ------------------------------------------------------------- |
| `fastify`        | HTTP server, presentation only                                |
| `zod`            | Boundary validation. Shared payloads move to `@erp/contracts` |
| `dotenv`         | Local environment loading                                     |
| `pino`           | Logging                                                       |
| `@prisma/client` | Queries inside infrastructure repositories                    |
| `pg`             | PostgreSQL driver                                             |

Dev libraries: `prisma`, `tsx`, `vitest`, `typescript`, `@types/node`, `@types/pg`.

Scripts: `lint`, `typecheck` (load `DATABASE_URL` from `.env.example` when it is unset, run `prisma generate`, then `tsc --noEmit`), `test`. There is no `dev` script and no `main.ts`. Nothing listens on a port.

### `src/modules`

Empty. This is where business capabilities will live. A future feature is expected to look like this:

```text
apps/api/src/modules/<feature>/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── errors/
│   └── ports/
├── application/
│   ├── use-cases/
│   ├── commands/
│   ├── queries/
│   └── dtos/
├── infrastructure/
│   ├── persistence/
│   ├── repositories/
│   └── mappers/
├── presentation/
│   └── http/
│       ├── routes/
│       ├── controllers/
│       └── schemas/
├── <feature>.module.ts
└── index.ts
```

That tree is the convention. It has not been created, including for Customer. The first real feature is supposed to establish the canonical files.

Layer rules:

- Presentation parses transport and calls the use case executor. It does not contain business rules.
- Application use cases coordinate entities and ports. They declare whether a transaction is required. They do not read Fastify request objects, call Prisma, or open a transaction.
- Domain code depends on language and its own types. It does not import Fastify, Prisma, `pg`, HTTP, presentation, or infrastructure.
- Infrastructure implements ports and uses the transaction-scoped Prisma client when a transaction is active.
- `<feature>.module.ts` wires the module. `index.ts` is the only public API.

Other modules import `index.ts`. They do not deep-import `infrastructure/*`, `presentation/*`, or `internal/*`. Cross-module work goes through that public API, an application port, or a domain or application event.

The execution pipeline is described in `docs/architecture/execution.md`. It is not implemented yet.

### `src/core`

Empty. Reserved for framework-independent concepts that would still make sense if Fastify and Prisma were replaced:

- `Entity`
- `AggregateRoot`
- `DomainEvent`
- `Result`
- `Pagination`
- `ApplicationError`

This folder is not a utility drawer. `helpers`, `misc`, `common`, and `utils` are not part of the layout.

### `src/platform`

Empty. Reserved for process-wide technical capabilities:

- database client (`platform/database`)
- logging
- cache
- event infrastructure
- configuration
- observability

The database client will live here. Prisma models will not. Those stay in `apps/api/prisma/schema/` with the module that owns them.

### Prisma schema

`apps/api/prisma/schema.prisma` sets the PostgreSQL datasource from `DATABASE_URL` and the `prisma-client-js` generator. It contains no models, so there is nothing to migrate. Later modules add their own files under `apps/api/prisma/schema/`.

`typecheck` runs `prisma generate` before `tsc` so the client exists.

### Vitest

`apps/api/vitest.config.ts` uses the Node environment, includes `src/**/*.test.ts`, and sets `passWithNoTests` so `pnpm test` succeeds while the suite is empty.

Later backend tests are three layers:

1. Use-case tests, which may use in-memory ports.
2. Repository integration tests against `TEST_DATABASE_URL`.
3. HTTP integration tests through the real Fastify routing and validation path.

Repository and HTTP tests use the test database. They do not mock Prisma, and they do not use the development database.

## `@erp/web`

Next.js `16.4.0` App Router application on React `19.3.0`. Created with TypeScript, ESLint, `src/`, Turbopack, and the `@/*` import alias. Tailwind was not enabled.

`next.config.ts` turns on `cacheComponents` and `partialPrefetching`. Those are the Next.js scaffold options.

`src/app` is the framework scaffold:

- `layout.tsx` loads Geist and Geist Mono and exports starter metadata
- `page.tsx` is the default Next.js welcome page
- `globals.css` and `page.module.css` are plain CSS from that scaffold
- `next-env.d.ts` references generated route types

That page is the starter. It is not an ERP screen. Later `app/**/page.tsx` files are route entries that render a feature screen.

Empty folders waiting for application code:

| Folder                   | Reserved for                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `src/features/<feature>` | That feature's `api/`, `components/`, `forms/`, `hooks/`, `lib/`, `screens/`, and `index.ts` |
| `src/shared/api`         | Browser and server HTTP client, error normalization                                          |
| `src/shared/auth`        | Session helpers, not login screens                                                           |
| `src/shared/config`      | Web runtime configuration                                                                    |
| `src/shared/forms`       | Generic React Hook Form adapters                                                             |
| `src/shared/hooks`       | Hooks used by more than one feature                                                          |
| `src/shared/lib`         | Pure helpers with one cohesive purpose                                                       |
| `src/shared/query`       | QueryClient setup                                                                            |
| `src/widgets`            | Application shell, such as a sidebar or workspace header                                     |
| `src/providers`          | Optional app-wide provider entry, still empty                                                |

A feature does not put its screen, table, or request functions in `shared/` or `widgets/`.

A future feature import across features uses the feature's public entry:

```ts
import { CustomerPicker } from "@/features/customers";
```

A deep import of another feature's internal file is rejected by dependency-cruiser.

### Installed frontend libraries

These design-system packages are dependencies of `@erp/ui`, not `@erp/web`. The web app depends on `@erp/ui` and must not import `@mui/*` or `@emotion/*`:

| Package               | Version installed | Intended use           |
| --------------------- | ----------------- | ---------------------- |
| `@mui/material`       | 9.5.0             | Accessible UI controls |
| `@mui/icons-material` | 9.5.0             | Icons                  |
| `@emotion/react`      | 11.14.0           | MUI's styling engine   |
| `@emotion/styled`     | 11.14.1           | MUI `styled`           |

These stay on `@erp/web` because they are application behavior, not base UI:

| Package                 | Version installed | Intended use                            |
| ----------------------- | ----------------- | --------------------------------------- |
| `@tanstack/react-query` | 5.104.1           | Server state                            |
| `react-hook-form`       | 7.89.0            | Form state                              |
| `@hookform/resolvers`   | 5.9.1             | Connect forms to Zod                    |
| `zod`                   | 4.6.5             | Schema validation shared with contracts |

Tailwind, shadcn/ui, `class-variance-authority`, `tailwind-merge`, and Zustand are not dependencies.

There is no `ThemeProvider`, no `QueryClientProvider`, and no Next.js Emotion cache file. The first screen that renders UI from `@erp/ui` should add the cache integration required by Next.js 16 inside `@erp/ui` or the app provider. That file stays free of ERP theme decisions. `apps/web` still does not import `@mui/*` or `@emotion/*`.

`typecheck` runs `next typegen && tsc --noEmit` so the typed-route files imported by `next-env.d.ts` exist before `tsc`.

### State, once features exist

- Server data belongs in TanStack Query.
- Shareable filters and route state belong in URL search params.
- Form state belongs in React Hook Form, with Zod from `@erp/contracts` when a contract exists.
- Short-lived UI state belongs in `useState` or `useReducer`.
- A global client store is added only when a concrete cross-feature need cannot live in the server, the URL, a form, or local state.

### Styling, once features exist

Material UI is the only primary UI framework. Emotion is used through MUI.

Order of styling decisions:

1. MUI component props (`color`, `variant`, `spacing`).
2. Theme values (`palette`, `spacing`, `breakpoints`, `shape`).
3. Theme component overrides and variants when many call sites need the same change.
4. A component in `@erp/ui` when the pattern is ERP-wide.
5. A local `sx` or `styled` block for a one-off exception.

Semantic tokens such as `primary`, `error`, `background.default`, `background.paper`, `text.primary`, `text.secondary`, and `divider` are the color language. Spacing goes through `theme.spacing`. Breakpoints go through `theme.breakpoints` and responsive prop objects. Repeated responsive layouts become components in `@erp/ui` rather than copied `sx` maps inside every feature.

A MUI component is wrapped only when the wrapper adds ERP-wide behavior, defaults, accessibility, variants, styling, or a stable API. Wrapping every control is not the goal.

Before adding a generic component, look at MUI, then `@erp/ui` primitives, layout, and patterns.

## `@erp/contracts`

Public export: `@erp/contracts` resolves to `src/index.ts`, which is `export {}`.

`src/common/` is empty. It is reserved for cross-cutting transport schemas such as pagination and `ApiError`.

This package holds Zod schemas for payloads that cross the HTTP boundary. TypeScript types are inferred with `z.infer`. A second handwritten interface for the same payload is not part of the design.

Future examples: `CreateCustomerRequest`, `CustomerResponse`, `CustomerListResponse`, `PaginationRequest`, `PaginatedResponse`, `ApiError`.

The package does not hold domain entities, aggregates, domain services, repository interfaces, Prisma models, or ORM row types. It does not import either application.

## `@erp/ui`

Public export: `@erp/ui` resolves to `src/index.ts`, which is `export {}`.

| Directory        | Future contents                        | Examples, not created                                                                                                                        |
| ---------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/primitives` | ERP defaults around low-level controls | Button, TextField, Select, Checkbox, Dialog, Drawer, Tabs, Chip, Tooltip, Menu, Table, Autocomplete, date controls                           |
| `src/layout`     | Page and form structure                | Page, PageContent, PageHeader, Stack, Grid, FormGrid, Section, Container                                                                     |
| `src/patterns`   | Repeated ERP screens structures        | DataTable, FilterBar, Pagination, EntityHeader, EntityForm, FormSection, EmptyState, ErrorState, LoadingState, ConfirmDialog, PermissionGate |
| `src/theme`      | The ERP MUI theme                      | `create-theme.ts`, `palette.ts`, `typography.ts`, `spacing.ts`, `shape.ts`, `components/`                                                    |

No `button/` or `input/` directories exist. Components are added when a feature needs them.

`@erp/ui` must stay application-independent. It does not import `apps/web` or `apps/api`. The API does not import `@erp/ui`.

## `@erp/test-utils`

Public export: `@erp/test-utils` resolves to `src/index.ts`, which is `export {}`.

The package exists so later tests can share setup. It has no helpers, fixtures, or product assertions. Those wait until two call sites need the same helper.

## Database environments

`docker-compose.yml` runs two PostgreSQL 17 services. Each has its own named volume and a `pg_isready` health check.

| Service         | Host port | Database   | Volume              | Use             |
| --------------- | --------- | ---------- | ------------------- | --------------- |
| `postgres`      | 5432      | `erp`      | `erp_postgres`      | Development     |
| `postgres-test` | 5433      | `erp_test` | `erp_postgres_test` | Automated tests |

Local placeholder user and password are both `erp`. `.env.example` contains only:

```text
DATABASE_URL=postgres://erp:erp@localhost:5432/erp
TEST_DATABASE_URL=postgres://erp:erp@localhost:5433/erp_test
```

`.env` is gitignored. These values are local placeholders.

Start them with `docker compose up -d` from the repository root.

### Persistence decisions recorded, not built

- Audit fields and change history: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `approvedBy`, `postedBy`, `cancelledBy`.
- Company scope: `organizationId`, `companyId`, `branchId`. This model is chosen before a large set of business tables is added.
- Idempotency for later retryable commands such as payments, invoice posting, stock movement, and webhooks.

HTTP handlers do not return raw database errors. Authentication and authorization stay separate concerns.

## Playwright

`playwright.config.ts` at the repository root:

- test directory `e2e/`
- base URL `http://127.0.0.1:3000`
- Chromium desktop project
- list reporter
- traces on the first retry
- `forbidOnly` when `CI` is set
- two retries when `CI` is set

The `e2e/` directory is not created yet. `pnpm verify` does not run Playwright, because a run with zero tests exits as a failure. Browsers are installed with `pnpm exec playwright install` before the first spec. When specs exist, that command can join the verify pipeline.

Playwright does not replace use-case tests or repository tests.

## Architecture enforcement

`.dependency-cruiser.cjs` is what `pnpm arch` runs. A violation fails the command. `pnpm verify` includes it.

Active rules:

| Rule                               | From                      | Cannot reach                      |
| ---------------------------------- | ------------------------- | --------------------------------- |
| `no-circular`                      | anywhere                  | a circular dependency             |
| `api-domain-not-infrastructure`    | `apps/api/src/**/domain/` | `apps/api/src/**/infrastructure/` |
| `api-domain-not-presentation`      | domain                    | presentation                      |
| `api-domain-not-fastify`           | domain                    | `fastify`                         |
| `api-domain-not-prisma`            | domain                    | `@prisma/client` or `prisma`      |
| `api-application-not-fastify`      | application               | `fastify`                         |
| `api-application-not-prisma`       | application               | `@prisma/client` or `prisma`      |
| `api-application-not-presentation` | application               | presentation                      |
| `api-domain-not-platform`          | domain                    | `apps/api/src/platform`           |
| `web-not-api`                      | `apps/web`                | `apps/api`                        |
| `web-not-mui`                      | `apps/web`                | `@mui/*` or `@emotion/*`          |
| `no-feature-deep-imports`          | a web feature             | another feature's internal files  |
| `ui-not-apps-web`                  | `packages/ui`             | `apps/web`                        |
| `ui-not-apps-api`                  | `packages/ui`             | `apps/api`                        |
| `contracts-not-apps-web`           | `packages/contracts`      | `apps/web`                        |
| `contracts-not-apps-api`           | `packages/contracts`      | `apps/api`                        |
| `api-not-ui`                       | `apps/api`                | `packages/ui`                     |

`node_modules` is not followed. TypeScript imports are resolved before compilation, using package `exports`.

`no-feature-deep-imports` allows a feature to import its own files and another feature's `index.ts`. It rejects other cross-feature paths.

Cursor rules describe the same boundaries. dependency-cruiser is the check that fails the command.

## Cursor guidance

### Rules

Files live in `.cursor/rules`. Front matter controls when each rule is applied.

| File                      | Applies                  | Subject                                                                                                     |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `00-project.mdc`          | always                   | Monorepo principles, package roles, strict TypeScript, MUI as the only UI framework, public package imports |
| `01-typescript.mdc`       | `**/*.{ts,tsx}`          | Unions, `unknown`, Zod inference, banned `any` and `@ts-ignore`                                             |
| `10-architecture.mdc`     | always                   | Inward dependencies, composition, `core` versus `platform`, module and feature public APIs                  |
| `20-backend.mdc`          | `apps/api/**/*.ts`       | Fastify, Zod, Prisma, Pino, module folders, controller and use-case duties, transactions                    |
| `21-database.mdc`         | `apps/api/**/*.{ts,sql}` | Client versus table ownership, separate test database, audit, company scope, idempotency                    |
| `22-api.mdc`              | `apps/api/**/*.ts`       | HTTP as presentation, contracts in `@erp/contracts`, no raw database errors                                 |
| `30-frontend.mdc`         | `apps/web/**/*.{ts,tsx}` | App Router, self-contained features, shared infrastructure, no Tailwind or shadcn                           |
| `31-ui-system.mdc`        | web and UI `tsx`         | MUI stack, theme tokens, spacing, breakpoints, when a wrapper is justified                                  |
| `32-state-management.mdc` | `apps/web/**/*.{ts,tsx}` | Query, URL, forms, local state                                                                              |
| `40-testing.mdc`          | `**/*.{ts,tsx}`          | Use-case, repository, and HTTP split; Playwright's place                                                    |
| `50-security.mdc`         | always                   | Secrets, logs, validation, least privilege, no production database for Cursor by default                    |

### Skills

Each skill is `.cursor/skills/<name>/SKILL.md`.

| Skill                     | Instructs the agent to                                                                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create-backend-feature`  | Read the architecture rules, design domain and ports, keep use cases free of Fastify and Prisma, add contracts, compose the module, add the three test layers, then lint, typecheck, and review boundaries |
| `create-frontend-feature` | Create `features/<feature>` with `api/`, `components/`, `forms/`, `hooks/`, `lib/`, and `screens/`, use `shared/` only for infrastructure, render the screen from a thin `page.tsx`, and forbid Tailwind   |
| `write-tests`             | Match the test to the boundary. Fake ports in use-case tests. Use the real test database for repositories. Keep Playwright from replacing those tests                                                      |
| `review-feature`          | Check layers, public imports, inferred contract types, MUI-only styling, state ownership, and that verification was actually run                                                                           |

### Agents

| Agent                             | Job                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `.cursor/agents/architect.md`     | Review boundaries, contracts, persistence, MUI reuse, security, and tests before implementation   |
| `.cursor/agents/verifier.md`      | Check the finished change independently. A green test run is not treated as proof of architecture |
| `.cursor/agents/test-reviewer.md` | Check the use-case, real-Postgres repository, and HTTP split                                      |

### Hooks

`.cursor/hooks.json` is version 1 with an empty `hooks` object. No hook runs.

### MCP

`.cursor/mcp.json` declares three local developer servers. Application scripts, Vitest, and CI do not call them.

| Server       | Launch                                      | Credential                                                                     |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `github`     | `npx @modelcontextprotocol/server-github`   | `GITHUB_PERSONAL_ACCESS_TOKEN` from the environment                            |
| `postgres`   | `npx @modelcontextprotocol/server-postgres` | `DATABASE_URL` from the environment. Point this at the local dev database only |
| `playwright` | `npx @playwright/mcp@latest`                | none                                                                           |

No production database is configured.

### AGENTS.md files

| File                    | What it tells an agent                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`             | Whole-repo map, dependency direction, and `pnpm verify`                                                                                                                        |
| `apps/api/AGENTS.md`    | Layer rules, `core` versus `platform`, module public APIs                                                                                                                      |
| `apps/web/AGENTS.md`    | MUI is the design system. Features own screens, components, forms, API, and hooks. `shared/` and `widgets/` stay infrastructure. The Next.js 16 agent note is kept below that. |
| `packages/ui/AGENTS.md` | MUI, then theme, primitives, layout, and patterns                                                                                                                              |

## Documentation already in the repo

This file is the single map of the current tree. The shorter docs next to it record decisions:

| Path                                    | Contents                                                    |
| --------------------------------------- | ----------------------------------------------------------- |
| `docs/architecture/overview.md`         | System shape and reserved future concerns                   |
| `docs/architecture/backend.md`          | Layers, module shape, transaction declaration               |
| `docs/architecture/execution.md`        | Executor, pipeline behaviors, idempotency, tenant isolation |
| `docs/architecture/frontend.md`         | MUI stack, styling order, responsive layout, state          |
| `docs/architecture/contracts.md`        | What belongs in `@erp/contracts`                            |
| `docs/architecture/database.md`         | Docker databases, Prisma ownership, audit and tenancy       |
| `docs/architecture/testing.md`          | Vitest, the three backend layers, Playwright                |
| `docs/adr/001-modular-monolith.md`      | One deployable backend with explicit module APIs            |
| `docs/adr/002-typescript-end-to-end.md` | Strict TypeScript and Zod inference                         |
| `docs/adr/003-postgresql.md`            | PostgreSQL, separate dev and test databases                 |
| `docs/adr/004-fastify.md`               | Fastify, Zod, Pino, presentation-only HTTP                  |
| `docs/adr/005-prisma.md`                | Prisma, module-owned schema files, transaction behavior     |
| `docs/adr/006-shared-contracts.md`      | `@erp/contracts` as the transport package                   |
| `docs/adr/007-material-ui.md`           | MUI as the UI foundation. Tailwind and shadcn are excluded  |

## What you run

```bash
pnpm install
docker compose up -d
pnpm dev
pnpm verify
```

`pnpm dev` starts the Next.js app. The API has no server entry, so it does not start a process.

Copy `.env.example` to `.env` before a later feature needs `DATABASE_URL`.

## What the next feature is expected to add

The first business slice, when it is requested, is the place that fills these reserved folders. A typical slice touches:

- a module under `apps/api/src/modules/<feature>` with domain, application, infrastructure, presentation, and a composition file
- a platform database client, the first time persistence is real
- Zod schemas in `@erp/contracts`
- a Prisma model file under `apps/api/prisma/schema/` for that module
- a feature folder under `apps/web/src/features/<feature>` with the folders that feature needs
- a thin `app/**/page.tsx` that renders one feature screen
- the first `@erp/ui` primitives or patterns that more than one screen would otherwise copy
- use-case tests, a shared-transaction rollback test, repository tests against `erp_test`, and HTTP tests

Until that work starts, the folders above stay empty on purpose.
