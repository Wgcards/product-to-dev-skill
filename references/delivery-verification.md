# Delivery Verification

## Directory Constraints

- Frontend code should go in `frontend/`, `web/`, or the user-specified directory.
- Backend development docs should be split by module in `docs/backend/<module-name>.md`.
- API docs should be split by module in `docs/api/<module-name>.md`.
- Add `docs/backend/index.md` and `docs/api/index.md` only when multiple modules need navigation.
- SQL files should go in `sql/`; name files by module, such as `sql/payment_order.sql`.
- New-project mock data should stay in Prism examples under `mock/examples/`; do not reintroduce runtime `src/mocks/mock-data.ts` for the default template.
- When Prism/OpenAPI mock support exists, runtime mock data must be served by Prism. Runtime services must not import fixture files or return hardcoded `{ data, code, codeMsg }` objects as mock-mode fallback.
- Mock or API service methods should stay in `src/features/<module>/service/` or the existing service directory for legacy projects.
- New projects should keep Prism contracts under `mock/`.
- New projects should keep real API switch logic in `src/shared/tools/APIClient`.
- New projects should keep DTOs in `src/types/dto/` and locale files in `src/locale/`.
- Do not generate unrelated template docs, empty directories, or unusable placeholder files.

## Verification Checklist

Frontend:

- Dependencies installed or already present.
- Typecheck or build passed.
- MUI ThemeProvider wraps the app in new projects.
- Existing/rebuilt projects use MUI-first for newly developed capabilities, while pre-existing complex surfaces either preserve the approved visual system or document any MUI adoption as visually and interactively parity-safe.
- Dialogs render as floating Dialog/Drawer surfaces rather than page-body pseudo-modals in new projects and new capabilities; existing/rebuilt projects may keep current modal/overlay components only for pre-existing surfaces when MUI would regress styling.
- Snackbar feedback defaults to top-center in new projects.
- Form validation errors appear under the relevant form controls.
- Routes are accessible.
- Core interactions operate: filter/search, create/edit, detail, status action, confirmation, error, empty, and loading states.
- All requests go through `src/shared/tools/APIClient` in new projects, or through the existing approved request wrapper.
- Domain fetch hooks expose at least `data`, `loading`, and `error` when generated.
- Prism can read `mock/openapi.yaml`; OpenAPI examples are split and referenced with `$ref`.
- Every runtime frontend service method that represents an HTTP/mock endpoint maps to an OpenAPI path and `operationId` when Prism/OpenAPI mock support exists.
- API docs endpoints marked implemented exist in OpenAPI; future endpoints are explicitly marked `Planned`, `Not implemented in frontend`, or `Not available in Prism mock`.
- OpenAPI schemas for frontend-consumed objects and array items are explicit enough to catch DTO drift; broad `additionalProperties: true` is used only for documented extension bags.
- Mock service returns the same fields documented in OpenAPI and API docs.
- APIClient rejects or reports a contract error when remote/mock/dev/test/prod responses omit the `{ data, code, codeMsg }` wrapper.
- `.env.mock`, `.env.dev`, `.env.test`, and `.env.prod` exist for new projects.
- `VITE_API_BASE_URL`, `VITE_PRISM_BASE_URL`, `VITE_API_MODE`, and `authorization` header paths are documented or implemented when a real API handoff is part of the delivery.
- `zh-CN` and `en-US` locale files exist and key order is aligned for new projects.
- User-visible frontend copy is locale-backed. No hardcoded UI copy remains in pages, components, hooks, services, APIClient/request wrappers, helpers, stores, constants, or mock fixtures except brand/product/protocol names, logs, comments, and tests.
- Frontend-generated fallback `codeMsg`, validation messages, Snackbar text, empty/loading/error states, aria labels, placeholders, and mock display copy resolve through locale dictionaries or a documented locale-aware API/mock source.
- The project-manager-specific check and production build pass when scripts exist, for example `pnpm check` and `pnpm build:prod` in new frontend projects.
- Dependency install or resolution failures, typecheck failures, lint failures, format-check failures, OpenAPI/mock check failures, build failures, and dev/mock smoke failures are blockers for full delivery.
- When the user asks to start the project, inspect available package scripts first. If Prism/OpenAPI mock files exist and `dev:mock` exists, start with `dev:mock`; otherwise use the project's normal `dev` or `dev:dev` script.
- After startup, if multi-environment config files exist and package scripts expose matching dev-mode commands such as `dev:mock`, `dev:dev`, `dev:test`, or scripts with `--mode <env>`, report the environment-to-command map and the environment actually started.
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
- Every implemented API doc endpoint has a matching OpenAPI path when Prism/OpenAPI support exists.
- Planned/future API doc endpoints are clearly labeled and not presented as currently implemented frontend/mock contracts.
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
- Frontend path and run/build commands, including `dev:mock` as the default start command when Prism mock support exists and the script is available, plus every detected environment start command when multi-environment dev scripts exist.
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
