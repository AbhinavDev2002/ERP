# Frontend architecture

`@erp/web` is a Next.js App Router application. Material UI is the design-system foundation. Emotion is used through MUI's default styling engine.

Tailwind CSS is intentionally not used. A utility-class system would compete with MUI's theme, spacing, breakpoints, and component variants, and it would split every screen across two styling languages. shadcn/ui is not used for the same reason: it would introduce a second component layer and, in its usual setup, Tailwind.

## Stack

```text
MUI
 -> ERP theme
 -> UI primitives
 -> layout abstractions
 -> ERP patterns
 -> feature components
 -> Next.js routes
```

| Layer      | Where it lives                    | Responsibility                                                                                |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| MUI        | `@erp/ui` (`@mui/material`)       | Accessible controls. Imported only inside `packages/ui`.                                      |
| ERP theme  | `packages/ui/src/theme`           | Palette, typography, spacing, shape, component variants                                       |
| Primitives | `packages/ui/src/primitives`      | ERP defaults around controls that need a shared API                                           |
| Layout     | `packages/ui/src/layout`          | Page, grid, stack, and form layout                                                            |
| Patterns   | `packages/ui/src/patterns`        | Data tables, filters, empty and error states, entity forms                                    |
| Features   | `apps/web/src/features/<feature>` | That feature's screens, components, forms, API calls, and hooks                               |
| Shared     | `apps/web/src/shared`             | HTTP client, session helpers, config, generic form adapters, cross-feature hooks, QueryClient |
| Widgets    | `apps/web/src/widgets`            | Application shell such as a sidebar or workspace header                                       |
| Routes     | `apps/web/src/app`                | Route entry. Render one feature screen. Stay thin.                                            |

The theme, primitive, layout, and pattern directories exist and are empty. The intended theme files, when a real visual language is introduced, are:

```text
theme/
├── create-theme.ts
├── palette.ts
├── typography.ts
├── spacing.ts
├── shape.ts
└── components/
```

## Feature ownership

A feature is self-contained. A small feature creates only the folders it needs.

```text
apps/web/src/features/<feature>/
├── api/            HTTP calls, query options, mutations, query keys
├── components/     UI used only by this feature
├── forms/          Form schemas, defaults, and React Hook Form orchestration
├── hooks/          UI logic used only by this feature
├── lib/            Pure helpers for this feature
├── screens/        Substantial screen composition
└── index.ts        The only public export
```

`app/**/page.tsx` is the Next.js route entry. It may read route params and render one feature screen. It does not hold the screen, the form, the table, or the data fetching.

Future route groups, not created in this factory, are `app/(public)`, `app/(auth)`, and `app/(workspace)/[organizationId]/...`. The Next.js starter page remains until those routes exist.

`src/shared` is infrastructure used by more than one feature:

- `api` for the browser client, the server client, and error normalization
- `auth` for session helpers, not login screens
- `config` for web runtime configuration
- `forms` for React Hook Form adapters around generic inputs
- `hooks` for hooks used by more than one feature
- `lib` for pure helpers with one cohesive purpose
- `query` for the QueryClient setup

`src/widgets` composes shell UI, such as a sidebar, from features and `@erp/ui`. It is not a dumping ground for feature screens.

Another feature is imported only through its `index.ts`. The barrel does not re-export server-only modules into the client graph.

Transport Zod schemas come from `@erp/contracts`. When a form shape differs from the HTTP body, the form schema and the mapper stay inside the feature. Query option factories live in the feature `api/` folder. A `useX` hook is optional.

Query keys for tenant data include the organization, and the company or branch when that scope changes the result. Isolating the browser cache does not replace Fastify authorization.

Fastify owns business use cases. Next.js does not reimplement them as Server Actions. Interactive lists and forms are Client Components. Server prefetch is added after one screen shows that it helps.

`cacheComponents` and `partialPrefetching` are on. Tenant financial and customer data stays private and out of a cache shared across sessions.

## How to style

Use the earliest level that already expresses the design:

1. MUI component props (`color="primary"`, `variant="outlined"`, `spacing={2}`).
2. Theme values (`theme.palette`, `theme.spacing`, `theme.breakpoints`, `theme.shape`).
3. Theme component overrides and variants when many call sites need the same change.
4. An `@erp/ui` abstraction when the pattern is ERP-wide.
5. A local `sx` or `styled` block only for a one-off exception.

`sx` and `styled` are MUI tools, not an invitation to hardcode `#1976d2`, raw pixel spacing, custom shadows, or custom breakpoints in feature code. Prefer semantic tokens such as `primary`, `error`, `background.default`, `background.paper`, `text.primary`, `text.secondary`, and `divider`.

## Responsive behavior

Use MUI's responsive system. Grid `spacing`, breakpoint objects, and `theme.breakpoints.up` / `down` are the default tools. Repeated responsive arrangements should become layout components in `@erp/ui` so feature code composes them instead of re-implementing the same breakpoint map.

## What not to wrap

Do not wrap every MUI component. A wrapper is justified when it adds ERP-wide behavior, defaults, accessibility, variants, styling, or a stable API. Before adding one, inspect MUI, then `@erp/ui` primitives, layout, and patterns.

## State

- Server state: TanStack Query, configured in the feature `api/` folder
- Shareable filters and route state: URL search params
- Form state: React Hook Form inside the feature, with Zod contracts where a contract exists
- Local transient state: `useState` or `useReducer`

Do not put ordinary server data in a global client store. Zustand is not installed. Add a dedicated client store only when a cross-feature requirement cannot live in the server, the URL, a form, or local state.

## Packages installed for later use

`@mui/material`, `@mui/icons-material`, `@emotion/react`, and `@emotion/styled` are dependencies of `@erp/ui` only. `@erp/web` depends on `@erp/ui` and does not depend on Material UI or Emotion. `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, and `zod` stay on `@erp/web`. This baseline does not add a theme provider, a query provider, or ERP components. The first screen that renders MUI should add the Next.js Emotion cache integration in `@erp/ui` or the app provider, still without inventing ERP theme decisions in the cache file.

The Next.js scaffold page remains the framework starter. It is not an ERP screen.
