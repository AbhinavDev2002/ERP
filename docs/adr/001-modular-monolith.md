# ADR 001: Modular monolith

## Status

Accepted

## Decision

The backend is one deployable modular monolith. Business capabilities are modules with explicit public APIs. Dependencies flow from presentation to application to domain. Infrastructure implements ports. A composition boundary wires concrete types.

## Consequences

- Feature code stays in one repository and one process while boundaries stay reviewable.
- Deep imports of another module's infrastructure or presentation are not allowed.
- A later split into separate services would start from module boundaries that already exist, not from a rewrite of a single unstructured application.
