# UI package instructions

`@erp/ui` is the application-independent ERP design system.

Stack:

```text
MUI foundation
-> ERP theme
-> primitives
-> layout
-> patterns
```

`@mui/material`, `@mui/icons-material`, and Emotion are dependencies of this package. `apps/web` must not import them. Screens compose this package instead.

Build on `@mui/material` and Emotion through MUI. Do not add Tailwind, shadcn/ui, or another styling system.

Do not import `apps/web` or `apps/api`.

Do not wrap a MUI component unless the wrapper adds ERP-wide behavior, defaults, accessibility, variants, styling, or a consistent API.

Prefer theme tokens, component variants, and `theme.spacing` / `theme.breakpoints` over hardcoded visual values.

The theme directory is reserved for a later split: palette, typography, spacing, shape, component overrides, and `create-theme`. Do not invent a parallel token system outside MUI's theme.
