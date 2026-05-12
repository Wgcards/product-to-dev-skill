# Mock And Integration

## Mock Data

- Mock data must cover normal, empty, error, boundary, and post-state-change scenarios when the workflow has those states.
- Keep all mock business records in a single source file by default: `src/mocks/mock-data.ts`.
- Mock service methods may be split by domain, but they must read and update the centralized mock data source.
- Do not place mock records inside page components.
- Mock records, TypeScript types, API examples, and SQL semantics must use the same field meanings.

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
- Simulate realistic latency for demos when it improves interaction feedback.
- Return error wrappers for validation failures, illegal state transitions, or mock exception scenarios.
- Use functional state updates in React when callbacks depend on previous state.

Each mock method should include a replacement comment like:

```ts
// TODO backend: GET /api/payment-orders - replace mock after Java API is ready.
```

## Switching From Mock To Real API

Provide handoff steps when delivering a project:

1. Configure `VITE_API_BASE_URL` or the target project's existing API base URL setting.
2. Use the bundled `src/services/api-client.ts` for new template projects, or replace service internals with the existing request wrapper or HTTP client used by the project.
3. Keep service method names and TypeScript DTOs stable.
4. Preserve the unified `{ data, code, codeMsg }` handling.
5. Send the token in the request header: `authorization: <backend-token>`. In the bundled template, store a local demo token as `localStorage.backendToken` or `VITE_BACKEND_TOKEN`; do not commit real production tokens.
6. Do not use cookies for frontend/backend auth.
7. Re-run frontend build and manually test loading, success, failure, empty, and illegal transition states.
