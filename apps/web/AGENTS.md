# Web application

`@erp/web` is the Next.js App Router frontend.

MUI is the frontend design-system foundation.

Do not use Tailwind.

Generic UI belongs in `@erp/ui`.

A feature owns its screens, components, forms, API calls, and hooks under `src/features/<feature>`.

`screens/` holds screen composition. `app/**/page.tsx` is only the route entry.

`src/shared` is web infrastructure: HTTP clients, session helpers, configuration, generic form adapters, cross-feature hooks, and the QueryClient. It is not a second place for feature screens.

`src/widgets` is application-shell composition, such as a sidebar or workspace header.

Use theme tokens and reusable components before introducing custom styling.

Server state uses TanStack Query inside the feature. Forms use React Hook Form. Shareable filters belong in the URL. Do not add a global client store unless a concrete cross-feature requirement exists.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
