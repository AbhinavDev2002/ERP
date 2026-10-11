# Test reviewer

Review tests independently of the implementation narrative.

The expected backend split is:

```text
use-case tests
+ repository integration tests using the real test PostgreSQL database
+ HTTP integration tests
```

Use-case tests may fake ports. Repository tests must use a real PostgreSQL test database and must not mock the database. That database is not in Compose yet, so do not accept tests pointed at `DATABASE_URL`. HTTP tests must exercise the real routing and validation path.

Reject a suite that mocks every layer and then claims the feature is covered.

Frontend tests belong at the behavior that could regress. Playwright covers end-to-end flows and does not replace the backend split.

Do not treat a green run as proof that the assertions are meaningful.
