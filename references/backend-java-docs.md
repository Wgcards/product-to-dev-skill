# Backend Java Docs

## Boundary

- Generate Java backend development documentation only.
- Do not create Java implementation source files such as Controller, Service, Mapper, Entity, DTO classes, Mapper XML, or tests unless the user explicitly changes the constraint.
- Split documentation by module. Use `docs/backend/<module-name>.md` by default.
- Documentation must be concrete enough for a later AI agent or Java developer to implement the same module without guessing core behavior.
- Read `module-documentation.md` before writing module docs.
- Read `backend-architecture.md` before writing development方案, cache, MQ/event, middleware, consistency, performance, or observability sections.

## Suggested Sections

For each backend module, include detailed recommendations. Use S1/S2/S3/N/A levels for middleware, cache, MQ, jobs, implementation order, and verification suggestions so downstream skills can make the final call.

- Module metadata: Module ID, module name, owner/actor, related modules, SQL file path, frontend surfaces, API doc path.
- Module responsibility and business scope.
- Table usage matrix with exact table names, access mode, key fields, and SQL source.
- Package structure suggestion.
- Layer responsibilities: API/controller layer, application service layer, domain service layer, data access layer, external adapter layer.
- Domain objects, request DTOs, response DTOs, entities, enums, and value objects to define.
- Core service methods, method responsibilities, input/output meanings, validations, transaction boundary, idempotency key, tables used, and related API IDs.
- Development-detail design for each core service method: pseudo-flow, field mapping, query/update fields, cache operations, event publishing, lock usage, error handling, rollback behavior, and observability points.
- Main process flow and state machine.
- Transaction boundaries and rollback rules.
- Idempotency rules, idempotency keys, and duplicate-submit handling.
- Distributed lock needs and lock keys when concurrency can corrupt state.
- Middleware recommendation matrix covering Redis/cache, distributed lock, MQ/event, scheduled job, external adapter, object storage, search/index, rate limit, circuit breaker, and degradation.
- Cache design: cache IDs, key patterns, value shape, TTL, read strategy, invalidation timing, consistency, stampede/penetration handling, and Redis failure behavior.
- MQ/event design: topic/queue, producer, consumer, payload, send timing, delivery semantics, consumer idempotency, retry, dead-letter, and compensation behavior.
- Scheduled job design: job name, trigger, sharding/lock, query window, batch size, idempotency, retry, and manual rerun behavior.
- Exception handling and error code mapping.
- Permission, login, tenant, merchant, organization, and data-isolation checks.
- Performance and capacity assumptions: data size, hot queries, indexes, pagination limit, batch size, cache hit target, MQ throughput, and slow-query mitigation.
- Log, audit, operation record, metrics, tracing, and alert recommendations.
- Async, MQ, scheduled, retry, and compensation tasks when relevant.
- Downstream skill handoff: read-first files, suggested implementation ownership, dependency recommendations, implementation order recommendations, verification suggestions, assumptions, and open issues.
- Traceability matrix linking business rules, APIs, service methods, tables, frontend surfaces, and test scenarios.

## Business Logic Detail

Write business logic as implementation-ready rules:

- Use IDs such as `BR-<MODULE>-001` for rules and `FLOW-<MODULE>-001` for flows.
- State every precondition, input, output, postcondition, and side effect.
- List validations in a table with validation ID, field, rule, error code, and `codeMsg`.
- List state transitions in a table with current state, action, target state, allowed actor, tables updated, and illegal-transition error.
- For calculated fields, define formulas, rounding, precision, null handling, and example values.
- For queries, define filter fields, default sorting, pagination model, table aliases, key conditions, and recommended indexes.
- For writes, define insert/update fields, audit fields, logical delete behavior, unique checks, and duplicate-submit behavior.
- For cache use, define exact key pattern, TTL, invalidation, stale-read tolerance, and fallback to DB.
- For MQ/event use, define event payload, producer timing, consumer idempotency, retry, dead-letter, and compensation.
- For middleware not suggested, state `N/A` and the reason so the downstream skill can decide whether project context changes the recommendation.
- For cross-module calls, define the owner module, input/output contract, timeout, retry, and fallback.

## Service Method Template

Use this structure for every important service method. It is a method design, not Java source code.

```markdown
### SVC-PAY-001 createPaymentOrder

- Layer: Application Service
- Related APIs: API-PAY-001
- Tables: payment_order (W), payment_order_details (W), sys_file (Ref)
- Transaction: S1 - use a local transaction; rollback on validation, insert, or attachment binding failure.
- Idempotency: `requestNo` or generated business no; duplicate create returns existing order summary when payload matches.
- Lock: N/A by default; unique index on `pay_order_no` and idempotency key should protect duplicate creation.
- Cache: S3 - invalidate `payment:order:{payOrderNo}` after successful update when the module uses order-detail cache.
- Event/MQ: S2 - publish `EVT-PAY-001 PaymentOrderCreated` after transaction commit when downstream approval or notification is enabled.
- Observability: S2 - log `pay_order_no`, `requestNo`, user ID, error code, and elapsed time.
- Preconditions:
  - User has payment order create permission.
  - Customer account exists and is active.
- Inputs:
  - `CreatePaymentOrderReqDTO`
- Outputs:
  - `PaymentOrderRespDTO`
- Steps:
  1. Validate required fields and amount precision.
  2. Validate customer and account status.
  3. Generate `pay_order_no`.
  4. Insert `payment_order`.
  5. Insert `payment_order_details`.
  6. Bind uploaded files by `relate_no`.
  7. Write operation log.
- Errors:
  - ERR-PAY-001: 客户账户不存在或不可用
  - ERR-PAY-002: 付款金额必须大于 0
```

## Data Access Detail

For each table used by the module, explain:

- Read/write scenarios.
- Query conditions and sort order.
- Insert/update/delete fields.
- Logical delete filter.
- Unique checks and corresponding indexes.
- Locking strategy when concurrent writes are possible.
- Cache read/write/invalidation relationship when the table feeds cache.
- Event or scheduled-job relationship when table changes trigger async work.
- Which SQL file defines or alters the table.

## Middleware Recommendation Matrix

Every backend module should include a middleware recommendation matrix. Use levels so downstream skills can adopt or adjust the方案.

```markdown
## Middleware Recommendations

| Middleware | Level | Scenario | Suggested Detail | Fallback |
| --- | --- | --- | --- | --- |
| Redis Cache | S1 / S2 / S3 / N/A | <查询加速/字典/锁/会话> | <key/TTL/失效规则> | <DB fallback/degraded response> |
| Distributed Lock | S1 / S2 / S3 / N/A | <并发写/重复提交/热点资源> | <lock key/timeout/owner> | <unique index/optimistic lock> |
| MQ/Event | S1 / S2 / S3 / N/A | <异步通知/跨模块一致性> | <topic/payload/retry> | <outbox/manual compensation> |
| Scheduled Job | S1 / S2 / S3 / N/A | <超时关闭/补偿/同步> | <cron/batch/lock> | <manual trigger> |
| External Adapter | S1 / S2 / S3 / N/A | <第三方/跨系统> | <timeout/retry/fallback> | <pending/retry state> |
```

## Cache Design

When cache is recommended, document:

- Cache ID.
- Key pattern.
- Value shape.
- TTL and TTL jitter.
- Read strategy.
- Invalidation or refresh timing.
- DB fallback.
- Cache penetration, breakdown, and stampede handling.
- Consistency expectation.
- Redis unavailable behavior.

When cache is not suggested, state `N/A` and the reason, such as low data volume, low query frequency, strong consistency requirement, or existing DB/index strategy is sufficient.

## MQ, Jobs, And External Systems

When the module has asynchronous or external behavior, document:

- Trigger timing and business preconditions.
- MQ topic, event name, or scheduled task name when known; otherwise propose clear names.
- Payload fields and idempotency key.
- Producer service method and transaction relationship: before commit, after commit, outbox table, or existing project pattern.
- Consumer ownership and consumer idempotency rule.
- Retry count, retry interval, timeout, and dead-letter or compensation behavior.
- External interface name, request fields, response fields, success condition, failure condition, and degradation strategy.
- How the frontend and API expose pending, partial-success, failure, and retryable states.

## Status And Validation

- Status fields should list all allowed values and meanings.
- State changes should list allowed previous states and target states.
- Illegal transitions should map to API error codes and user-facing `codeMsg`.
- Backend validation should not rely on frontend validation alone.
- Security and data-scope checks should be listed at the backend layer that enforces them.

## Industry-Mainstream方案 Rules

- Follow existing project conventions first.
- If there is no existing convention, use the mainstream Java/Spring layered baseline in `backend-architecture.md`.
- Prefer local MySQL transaction plus MQ/eventual consistency for cross-module side effects.
- Keep MySQL as the business source of truth; Redis cache recommendations should document consistency and fallback.
- Prefer idempotent consumers for MQ because at-least-once delivery is the practical default.
- Prefer database unique constraints and optimistic locks for ordinary concurrent writes; use distributed locks only when the business scenario requires it.
- Include degradation and compensation design when an external dependency can fail.
- Include metrics, logs, traces, and alert points for critical business flows.

## Downstream Skill Handoff

Every backend module doc should include this section because later implementation may be performed by another skill. This section is advisory: downstream skills make the final implementation decision with project context and should record meaningful deviations.

```markdown
## Downstream Skill Handoff

### Read First

| Artifact | Path | Purpose |
| --- | --- | --- |
| Backend Design | docs/backend/<module-name>.md | Recommended baseline for service, business rules, middleware, consistency |
| API Contract | docs/api/<module-name>.md | Recommended baseline for endpoints, DTOs, response wrapper, errors |
| SQL | sql/<module-name>.sql | Recommended baseline for tables, indexes, comments, logical deletion |

### Implementation Ownership

| Layer | Level | Suggested Files/Classes | Notes |
| --- | --- | --- | --- |
| Controller | S2 | `<Module>Controller` | Follow API IDs and response wrapper unless the project has a stronger API convention |
| Application Service | S2 | `<Module>AppService` | Suggested owner of transaction, idempotency, locks, events |
| Domain Service | S2 | `<Module>DomainService` | Suggested owner of business rules and state machine |
| Repository/Mapper | S2 | `<Module>Mapper` | Suggested owner of SQL access for listed tables |
| Async/Job | S2 / S3 / N/A | `<Module>EventConsumer`, `<Module>Job` | Depends on middleware recommendation |

### Implementation Order

1. Apply SQL or migration.
2. Create DTO/entity/enums/value objects.
3. Implement mapper/repository queries and writes.
4. Implement domain rules and state machine.
5. Implement application service transactions, idempotency, cache, MQ, and locks.
6. Implement controller/API.
7. Implement consumers, jobs, adapters, and compensation.
8. Add tests and run verification scenarios.

### Downstream Decision Notes

- Treat these docs as the recommended baseline, not an unchangeable implementation command.
- Avoid silently changing table names, logical deletion field, status values, API wrapper, error codes, cache keys, MQ topics, or permission semantics. If the implementation changes them, record the reason and update related docs when practical.
- Review `OPEN-<MODULE>-<n>` items before coding if they affect core behavior.
```

## Suggested Markdown Skeleton

```markdown
# <Module> Backend Development Design

## 1. Module Metadata
## 2. Module Responsibility
## 3. Table Usage
## 4. Package Structure
## 5. Domain Model And DTOs
## 6. Business Rules
## 7. Core Flows
## 8. State Machine
## 9. Service Method Design
## 10. Data Access Design
## 11. Middleware Recommendations
## 12. Cache Design
## 13. MQ, Jobs, And External Integration
## 14. Validation And Permissions
## 15. Transaction, Idempotency, And Concurrency
## 16. Performance And Capacity
## 17. Exceptions And Error Codes
## 18. Logs, Audit, Metrics, Tracing, And Alerts
## 19. Traceability
## 20. Downstream Skill Handoff
## 21. Assumptions And Open Issues
```
