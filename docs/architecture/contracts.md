# Shared contracts

`@erp/contracts` is the transport boundary between `@erp/web` and `@erp/api`, and any other future client of the HTTP API.

Put request and response schemas here when both sides must agree on the payload. Prefer Zod. Infer TypeScript types with `z.infer`. Do not maintain a handwritten interface next to the schema.

Examples of future contracts:

- `CreateCustomerRequest`
- `CustomerResponse`
- `CustomerListResponse`
- `ApiError`
- `PaginationRequest`
- `PaginatedResponse`

## What does not belong here

- Domain entities and aggregates
- Domain services
- Repository interfaces
- Prisma models and the generated client
- ORM row types
- React components

The package currently exports nothing. `src/common/` is reserved for future cross-cutting transport schemas such as pagination and API errors. Do not add a business schema until a feature needs it.

`@erp/contracts` must not import `apps/web` or `apps/api`. Application code imports the package entry point `@erp/contracts`, not files under `src/`.
