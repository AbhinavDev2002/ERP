# ADR 007: Material UI

## Status

Accepted

## Decision

Use Material UI as the primary frontend component and design-system library.

## Consequences

- MUI provides accessible low-level UI components.
- ERP visual consistency is controlled through an application theme.
- Reusable ERP abstractions are built in `@erp/ui`.
- Feature components consume `@erp/ui` and MUI appropriately.
- Tailwind is not used.
- shadcn/ui is not used.
- Avoid introducing competing styling systems.
- A MUI component is wrapped only when the wrapper adds ERP-wide behavior, defaults, accessibility, variants, styling, or API consistency.
