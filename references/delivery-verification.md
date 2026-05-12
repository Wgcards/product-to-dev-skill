# Delivery Verification

## Directory Constraints

- Frontend code should go in `frontend/`, `web/`, or the user-specified directory.
- Backend development docs should be split by module in `docs/backend/<module-name>.md`.
- API docs should be split by module in `docs/api/<module-name>.md`.
- Add `docs/backend/index.md` and `docs/api/index.md` only when multiple modules need navigation.
- SQL files should go in `sql/`; name files by module, such as `sql/payment_order.sql`.
- Mock data should stay inside the frontend project, defaulting to `src/mocks/mock-data.ts`.
- Mock or API service methods should stay in `src/services/` or the existing service directory.
- New bundled-template projects should keep real API switch logic in `src/services/api-client.ts`.
- Do not generate unrelated template docs, empty directories, or unusable placeholder files.

## Verification Checklist

Frontend:

- Dependencies installed or already present.
- Typecheck or build passed.
- Routes are accessible.
- Core interactions operate: filter/search, create/edit, detail, status action, confirmation, error, empty, and loading states.
- Mock service returns the same fields documented in API docs.
- `VITE_API_BASE_URL` switch and `authorization` header path are documented or implemented when a real API handoff is part of the delivery.
- UI text does not overflow common desktop/mobile widths.
- If frontend UI/UE/UX fell back because `ui-ux-pro-max` was unavailable, the final handoff tells the user to install UI UX Pro MAX through their standard skill installation process without adding installation instructions.

Backend docs:

- Each business module has its own backend doc.
- Module metadata, table usage matrix, responsibilities, layers, domain model, service methods, development-detail pseudo-flow, complete business rules, validations, permissions, transactions, idempotency, concurrency, state machine, exceptions, async/external tasks, cache, MQ/event, middleware recommendation matrix, performance/capacity, logs, audit, metrics, tracing, alerts, and traceability are covered.
- Every service method lists related API IDs and exact tables used.
- Every module gives S1/S2/S3/N/A recommendations for cache, distributed lock, MQ/event, scheduled job, external adapter, object storage, search/index, rate limit, circuit breaker, and degradation when enough context exists.
- Cache recommendations include key patterns, value shape, TTL, invalidation, consistency, stampede/penetration handling, and Redis failure behavior when cache is suggested.
- MQ/event recommendations include topic/queue, producer, consumer, payload, send timing, idempotency, retry, dead-letter, and compensation when async processing is suggested.
- Backend方案 follows existing project conventions or the mainstream Java/Spring baseline from `backend-architecture.md`.
- A downstream skill handoff section exists when backend docs are generated and lists read-first artifacts, suggested implementation ownership, dependency recommendations, implementation order suggestions, verification suggestions, assumptions, and open issues.
- No Java implementation code was generated.

API docs:

- Each business module has its own API doc.
- Every frontend mock service has a matching endpoint.
- Unified `{ data, code, codeMsg }` wrapper is used.
- Auth uses `authorization` header.
- Pagination, sorting, filtering, state transitions, and error codes are documented.
- Every endpoint lists module ID, API ID, service method, rule IDs, tables used, SQL source, permission, idempotency, transaction notes, cache impact, and MQ/event impact when relevant.

Cross-document alignment:

- Module IDs match across backend docs, API docs, SQL filenames, frontend services, and final handoff.
- Table names match exactly across backend docs, API docs, SQL files, mock data, and TypeScript types.
- Business rule IDs referenced by APIs exist in backend docs.
- Error codes and `codeMsg` values match between backend docs, API docs, frontend mock services, and UI behavior.
- State transitions match between backend docs, API docs, mock behavior, and frontend actions.
- Downstream skill handoff paths point to files that exist in the delivery package.

SQL:

- DDL is written to SQL files.
- MySQL rules in `database-mysql.md` pass self-check.
- Table names, fields, comments, indexes, unique constraints, audit fields, and logical delete fields are consistent.

## Final Handoff

Final answers should include:

- What is now usable.
- Frontend path and run/build commands.
- Backend doc path.
- API doc path.
- Mock data and service paths.
- SQL file path.
- Module list and which tables each module uses.
- Verification commands run and results.
- Important assumptions.
- Recommended next backend integration step.

Avoid exposing implementation trivia unless the user asks.

## Execution Boundaries

- When rules are unclear, make product-minded assumptions and mark them; do not stop at a question list.
- Business requirement descriptions default to full delivery: complete frontend code, mock, backend docs, API contracts, SQL, verification notes, and handoff notes.
- When the user explicitly asks only for a plan, docs, APIs, SQL, or another partial artifact, do not create unrelated artifacts; state what was intentionally skipped.
- Do not treat mock as final backend implementation.
- Do not expose secrets, real tokens, database connections, or production API addresses in frontend pages.
- Do not generate Java backend implementation source files unless the user explicitly changes the constraint.
- Do not ignore user-provided table models; if there is a conflict, explain the risk and choose a compatible adjustment.
