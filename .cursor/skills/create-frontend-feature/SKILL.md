---
name: create-frontend-feature
description: Create a Next.js feature on Material UI and shared contracts without introducing Tailwind or duplicate UI.
---

# Create frontend feature

When creating a frontend business capability:

1. Inspect the API contract in `@erp/contracts`.
2. Inspect the existing MUI theme and component APIs.
3. Inspect `@erp/ui` primitives, layout, and patterns.
4. Search the current feature before adding a component.
5. Reuse existing abstractions from `@erp/ui`. Do not import `@mui/*` or `@emotion/*` from `apps/web`. Inside `@erp/ui`, do not wrap a MUI component unless the wrapper adds ERP-wide behavior, defaults, accessibility, variants, or API consistency.
6. Create the feature under `apps/web/src/features/<feature>/` with only the folders it needs: `api/`, `components/`, `forms/`, `hooks/`, `lib/`, `screens/`, and `index.ts`.
7. Put HTTP calls, query option factories, mutations, and query keys in `api/`. A `useX` hook is optional and stays in `hooks/`.
8. Put substantial screen composition in `screens/`. Add `app/**/page.tsx` as the route entry that reads route params and renders that screen. Do not put the screen, form, or table in the route file.
9. Use `shared/` only for cross-feature infrastructure such as the HTTP client, query setup, or a generic form adapter. Do not put this feature's screen, table, or request in `shared/` or `widgets/`.
10. Keep transport types inferred from `@erp/contracts`. Keep a separate form schema in the feature only when the form shape differs from the HTTP body.
11. Verify responsive behavior with MUI breakpoints, spacing, and layout components rather than custom pixel logic.
12. Run tests, typecheck, lint, and build.

Do not introduce Tailwind CSS, Tailwind utility classes, shadcn/ui, or another styling framework.

Do not import `@mui/*` or `@emotion/*` from a feature, widget, or `shared/` folder. Those imports belong in `@erp/ui`.

Do not duplicate request or response interfaces that can be inferred from a Zod contract.

Do not deep-import another feature. Export only the public surface from `index.ts`, and do not re-export server-only modules into the client graph.

Do not add a global client store unless a concrete cross-feature client-state requirement exists.
