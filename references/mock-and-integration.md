# Mock And Integration

## Prism And OpenAPI

- New projects use Prism + OpenAPI as the primary mock system.
- Create `mock/openapi.yaml` as the Prism entry.
- Split contract details under `mock/components/` for schemas, parameters, responses, and requestBodies.
- Split example payloads under `mock/examples/`.
- Use `$ref` from `mock/openapi.yaml`; do not pile every schema and example into the entry file.
- All frontend service methods must map to a path + operation in `mock/openapi.yaml`.
- Existing projects keep their current mock system unless the user approves migration.

## Mock Coverage

Prism examples must cover relevant workflow states:

- Normal data.
- Empty data.
- Business error.
- Form validation error.
- Illegal state transition.
- Permission or login-state failure.

Mock records, OpenAPI schemas, DTOs, API docs, service fields, and SQL semantics must use the same field meanings.

## Unified API Wrapper

Use this response structure for frontend mock and API docs:

```json
{
  "data": {},
  "code": "200",
  "codeMsg": null
}
```

Rules:

- `code` is a string.
- `code === "200"` means success and the frontend reads `data`.
- `code !== "200"` means failure and the frontend displays `codeMsg` directly.
- Do not introduce a parallel response wrapper.
- Pagination should reuse the existing project model when available, such as `JaPageRespDTO`.

## Service Layer

- Put all mock or real API-facing methods in the service layer.
- Keep method names business-oriented and stable: for example `listPaymentOrders`, `submitApproval`, `updateOrderStatus`.
- In new projects, service methods call `src/shared/tools/APIClient` and never call `fetch` directly.
- In existing projects, use the existing request wrapper unless the user approves a migration.
- Simulate realistic loading and error states through Prism examples and UI state; do not hide contract errors in page components.
- Return error wrappers for validation failures, illegal state transitions, or mock exception scenarios.
- Use functional state updates in React when callbacks depend on previous state.

If a temporary in-memory mock remains during migration, include a replacement comment like:

```ts
// TODO backend: GET /api/payment-orders - replace mock after Java API is ready.
```

## Switching From Mock To Real API

Provide handoff steps when delivering a project:

1. Configure `VITE_API_MODE`, `VITE_API_BASE_URL`, and `VITE_PRISM_BASE_URL`, or the target project's existing API base URL settings.
2. Use `src/shared/tools/APIClient` for new template projects, or replace service internals with the existing request wrapper or HTTP client used by the project.
3. Keep service method names and TypeScript DTOs stable.
4. Preserve the unified `{ data, code, codeMsg }` handling.
5. Send the token in the request header: `authorization: <backend-token>`. Store only local demo tokens in `.env.mock` or local storage; do not commit real production tokens.
6. Do not use cookies for frontend/backend auth.
7. Re-run OpenAPI validation, frontend checks, and manual tests for loading, success, failure, empty, validation error, and illegal transition states.

## Env Scripts

New projects should provide:

- `mock:serve` for Prism.
- `mock:check` or `openapi:check` for OpenAPI validation.
- `dev:mock` to run Prism and Vite together with `.env.mock`.
- `dev:dev`, `dev:test`, and `build:prod` for `.env.dev`, `.env.test`, and `.env.prod`.

When a user asks to start the frontend project, use `dev:mock` by default if Prism/OpenAPI mock support exists and the script is available. After startup, if multiple `.env.*` files and matching dev scripts exist, report each environment's command to the caller, such as `mock -> pnpm dev:mock`, `dev -> pnpm dev:dev`, and `test -> pnpm dev:test`, and state which one is currently running.
