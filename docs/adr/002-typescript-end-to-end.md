# ADR 002: TypeScript end to end

## Status

Accepted

## Decision

Applications and shared packages are TypeScript. The shared compiler configuration is strict, including `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and `verbatimModuleSyntax`. API payloads that cross the web and API boundary are Zod schemas in `@erp/contracts`, and TypeScript types are inferred from those schemas.

## Consequences

- The web and API do not maintain two handwritten interfaces for the same payload.
- Compiler flags are not weakened to silence generated or application code.
- `any`, `@ts-ignore`, and unchecked assertions are defects, not escape hatches.
