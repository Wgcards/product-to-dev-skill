# Module Documentation

## Module-First Rule

Split backend and API documentation by business module before writing details. A module should map to one coherent business capability, such as payment orders, approvals, customer accounts, file management, reconciliation, notifications, or configuration.

Use this output pattern unless the target repo already has a stronger convention:

- Backend docs: `docs/backend/<module-name>.md`
- API docs: `docs/api/<module-name>.md`
- SQL: `sql/<module-name>.sql`
- Optional index when there are multiple modules: `docs/backend/index.md` and `docs/api/index.md`

Do not combine unrelated modules into one large backend or API document. If a workflow crosses modules, document the owning module and list cross-module dependencies explicitly.

## Module Identification

For each module, define these fields at the top of both backend and API docs:

| Field | Meaning |
| --- | --- |
| Module ID | Stable lowercase id, such as `payment-order` |
| Module Name | Chinese business name |
| Business Owner | User role or business team |
| Primary Objects | Core entities handled by the module |
| Related Modules | Upstream/downstream modules |
| SQL File | SQL file path, such as `sql/payment_order.sql` |
| Tables Used | Explicit table list with read/write purpose |
| Frontend Surfaces | Pages, routes, dialogs, or service methods |

## Table Usage Marking

Every module doc must contain a table usage matrix. Use exact table names, not vague labels.
Use the logical deletion field from the actual data model when listing key fields. The example below uses `is_delete`; replace it with `is_deleted` or another project field name when the data model does.

```markdown
## Table Usage

| Table | Alias | Access | Purpose | Key Fields | SQL Source |
| --- | --- | --- | --- | --- | --- |
| payment_order | po | R/W | 付款单主记录 | id, pay_order_no, status, pay_status, is_delete | sql/payment_order.sql |
| payment_order_details | pod | R/W | 付款单明细 | id, pay_order_no, batch_no, pay_money | sql/payment_order.sql |
| sys_file | sf | R | 附件查询 | relate_no, file_url, type | sql/payment_order.sql |
```

Access values:

- `R`: read only.
- `W`: write only.
- `R/W`: read and write.
- `Ref`: referenced for validation or display but not directly mutated.

For each service method and endpoint, repeat the relevant table names in a "Tables" field so downstream AI can implement data access without searching the whole document.

## AI-Readable Style

Write docs for a future AI developer as much as for humans:

- Use stable IDs for rules, flows, endpoints, errors, and use cases, such as `BR-PAY-001`, `FLOW-PAY-002`, `API-PAY-003`, `ERR-PAY-004`.
- Prefer tables for rules, fields, state transitions, validations, and mappings.
- Use short declarative sentences. Avoid hidden requirements in long prose.
- Use explicit inputs, outputs, preconditions, postconditions, and side effects.
- Use pseudo-flow or ordered steps for business algorithms, but do not generate Java source code.
- Cross-reference related items by ID: endpoint -> service method -> business rule -> table -> SQL file.
- Mark assumptions with `ASSUMPTION-<MODULE>-<n>` and open issues with `OPEN-<MODULE>-<n>`.
- Include concrete examples for request, response, state transition, and error scenarios.

## Downstream Skill Recommendations

Generated documents are the recommended implementation baseline for later development skills. Each module doc should be self-contained enough that another skill can understand the business and technical intent without re-reading the original user chat.

Use recommendation levels so downstream skills can make final decisions:

| Level | Meaning | Downstream Handling |
| --- | --- | --- |
| S1 | Strongly recommended; changing it can affect business correctness, data consistency, or integration compatibility. | Usually follow; if changed, record the reason and update related docs. |
| S2 | Recommended mainstream implementation; good default when project conventions do not conflict. | Follow or adapt to project conventions. |
| S3 | Optional optimization or future enhancement. | Implement only when time, scope, and project needs justify it. |
| N/A | Not suggested for this module. | Skip unless new requirements appear. |

Each module backend doc should include a "Downstream Skill Handoff" section with:

- Read-first files: backend doc path, API doc path, SQL file path, frontend service/type paths, and related module docs.
- Suggested implementation ownership: module boundary, package suggestion, classes/interfaces to create, and files likely unrelated to the change.
- Suggested dependency decisions: upstream/downstream modules, external systems, cache keys, MQ topics, scheduled jobs, and table ownership with S1/S2/S3/N/A levels.
- Suggested implementation order: SQL/migration, DTO/entity/enums, mapper/repository, domain service, application service, controller/API, async consumers/jobs, tests.
- Suggested verification expectations: unit tests, integration tests, API examples, SQL self-check, and manual scenarios.
- Open issues and assumptions: list every assumption that downstream skills should preserve, resolve, or intentionally change before coding.

Downstream skills may adjust suggested class names, middleware choices, cache strategy, MQ topics, implementation order, or verification scope when the target project requires it. They should not silently change business rules, table names, status values, response wrappers, error codes, or permission semantics; if implementation requires a change, update the docs or clearly mark the deviation.

## Business Logic Completeness

A module is easiest for downstream skills to implement when it documents these recommended details:

- Actors and permissions.
- Main use cases and alternate/error flows.
- Full field semantics for request DTO, response DTO, entity, and table columns.
- Complete validation rules, including backend-only rules.
- Status machine with allowed transitions and illegal transition errors.
- Transaction boundaries and rollback behavior.
- Idempotency rules and duplicate-submit handling.
- Concurrency controls, locks, and race-condition handling when relevant.
- Cache recommendation level, cache keys, TTLs, invalidation, and failure behavior when cache is suggested; or `N/A` with a reason.
- MQ/event recommendation level, topics, payloads, producer/consumer, retry, dead-letter, and compensation behavior when async consistency is suggested; or `N/A` with a reason.
- Middleware recommendation matrix covering cache, distributed lock, MQ/event, scheduled job, external adapter, object storage, search/index, rate limit, circuit breaker, and degradation when relevant.
- Data access rules: tables, query conditions, indexes, insert/update fields, logical delete behavior.
- External system, MQ, scheduled task, file, or notification behavior when relevant.
- Audit, operation log, and business event requirements.
- Error codes, `codeMsg`, and frontend display behavior.

## Traceability Matrix

Add a traceability matrix near the end of each module backend doc:

```markdown
## Traceability

| Requirement/Rule ID | API ID | Service Method | Tables | Frontend Surface | Test Scenario |
| --- | --- | --- | --- | --- | --- |
| BR-PAY-001 | API-PAY-001 | PaymentOrderAppService.createPaymentOrder | payment_order, payment_order_details | PaymentOrderCreatePage | 正常创建付款单 |
```

This matrix is required for modules with more than one endpoint or more than one table.

## Industry Baseline

When the user gives no stronger project convention, follow mainstream backend documentation practices:

- REST resource naming and stable DTO contracts.
- Clear separation of controller/API, application service, domain service, repository/mapper, external adapter, and async job responsibilities.
- Explicit auth, permission, data-scope, validation, transaction, idempotency, cache, MQ/event, scheduled job, distributed lock, middleware decision, logging, metrics, tracing, and observability sections.
- Explicit pagination, sorting, filtering, optimistic/pessimistic locking, and error semantics.
- MySQL remains the source of truth; Redis cache and MQ/events are supporting infrastructure with documented consistency and failure behavior.
- SQL-first table source of truth with consistent names across docs, frontend types, API fields, and mock data.
- Docs-first development: later coding skills start from the generated docs as a recommendation baseline and may adapt with an explicit reason.
