# ERP repository

This repository is a TypeScript ERP monorepo.

## Applications

- `apps/api`: Node.js and Fastify backend (`@erp/api`)
- `apps/web`: Next.js frontend (`@erp/web`)

## Shared packages

- `packages/contracts`: Zod API schemas and shared transport contracts
- `packages/ui`: reusable design-system components built on Material UI
- `packages/typescript-config`: shared TypeScript configuration
- `packages/eslint-config`: shared lint configuration
- `packages/test-utils`: shared test helpers

## Backend architecture

The backend is a feature-oriented modular monolith.

Each business feature normally contains domain, application, infrastructure, and presentation code. A composition boundary wires those concrete dependencies.

Dependencies flow inward:

```text
presentation -> application -> domain
```

Infrastructure implements application and domain ports.

`apps/api/src/core` is reserved for framework-independent abstractions. `apps/api/src/platform` is reserved for technical capabilities. Neither folder is a general utility drawer.

## Frontend architecture

Material UI is the only primary UI framework. Tailwind and shadcn/ui are not used.

```text
MUI -> ERP theme -> @erp/ui primitives -> layout -> patterns -> feature UI -> routes
```

- Generic UI belongs in `packages/ui`
- A feature owns its screens, components, forms, API calls, and hooks under `apps/web/src/features/<feature>`
- `apps/web/src/shared` is web infrastructure, not feature screens
- `apps/web/src/widgets` is application-shell composition
- `apps/web/src/app/**/page.tsx` is the route entry and renders one feature screen

## Boundaries

Import `@erp/contracts`, `@erp/ui`, and `@erp/test-utils` through their package entry points. Those packages are consumed from TypeScript source.

`@erp/ui` must not import either application. `@erp/contracts` must not import either application. `apps/api` must not import `@erp/ui`.

Future backend modules expose a public API. Future frontend features do the same. Do not deep-import another feature or module's internal files.

## Before implementing

Search the existing codebase for a canonical example.

Reuse existing patterns instead of inventing new architecture.

## Required verification

Before considering work complete, run `pnpm verify`, which performs:

1. format check
2. lint
3. typecheck
4. architecture validation
5. unit tests
6. build

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
