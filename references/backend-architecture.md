# Backend Architecture Baseline

## Purpose

Use this reference when writing Java backend development documentation. The goal is to make backend docs detailed enough for a Java developer or a later AI agent to understand the recommended technical方案 without guessing.

Existing project conventions always win. If the target project already uses a specific framework, cache, MQ, job scheduler, tracing system, permission model, or data-access convention, follow it and document the discovered convention. If there is no existing convention, use the mainstream Java enterprise baseline below.

## Mainstream Java Enterprise Baseline

Default to a Spring Boot style layered architecture unless the project says otherwise:

- API/controller layer: parameter parsing, login context, permission entry, response wrapper, no business orchestration.
- Application service layer: use-case orchestration, transaction boundary, idempotency, lock, event publishing, cross-module calls.
- Domain service layer: core business rules, state machine, calculations, validation that belongs to the domain.
- Repository/mapper layer: MySQL access, query conditions, logical deletion, optimistic/pessimistic lock, batch operations.
- External adapter layer: third-party systems, file services, notification, payment, approval, or other remote calls.
- Infrastructure layer: cache, MQ, scheduled jobs, distributed locks, config, audit, logging, metrics, tracing.

For each module, document recommendations for whether it needs:

- Redis cache.
- Distributed lock.
- MQ or domain events.
- Scheduled job.
- External adapter.
- File/object storage.
- Search/index service.
- Rate limit, circuit breaker, or degradation strategy.

Use recommendation levels instead of hard requirements:

| Level | Meaning |
| --- | --- |
| S1 | Strongly recommended for correctness, consistency, security, or integration compatibility. |
| S2 | Recommended mainstream default when project conventions do not conflict. |
| S3 | Optional optimization or future enhancement. |
| N/A | Not suggested for the current module; include the reason. |

If a component is not suggested, write `N/A` and the reason so downstream skills can decide whether new project context changes that decision.

## Cache Design

Document cache only when it improves read performance, reduces repeated remote calls, stores short-lived workflow state, or supports distributed coordination. Do not use cache as the source of truth for business data.

For each cache item, document:

| Field | Suggested Detail |
| --- | --- |
| Cache ID | Stable ID such as `CACHE-PAY-001` |
| Purpose | What read or coordination problem it solves |
| Store | Redis, local cache, or existing project cache |
| Key Pattern | Exact pattern, such as `payment:order:{payOrderNo}` |
| Value Shape | Fields or DTO serialized into cache |
| TTL | Expiration and reason |
| Read Strategy | cache-aside, read-through, local-only, or existing project pattern |
| Write/Invalidation | When to delete, update, or refresh cache |
| Consistency | Allowed staleness and fallback to DB |
| Stampede Protection | Lock, random TTL jitter, null-value cache, or N/A |
| Failure Behavior | What happens when Redis is unavailable |

Mainstream defaults:

- Use cache-aside for ordinary query acceleration.
- Use short TTL plus explicit invalidation for frequently changed data.
- Use null-value cache for hot missing keys when penetration risk exists.
- Use distributed lock or single-flight protection for hot expensive rebuilds.
- Keep MySQL as the source of truth.

## MQ And Event Design

Use MQ/events for cross-module async processing, notifications, integration callbacks, eventual consistency, heavy post-processing, or retryable side effects. Keep synchronous transactions small; publish events after DB state is safely persisted.

For each event, document:

| Field | Suggested Detail |
| --- | --- |
| Event ID | Stable ID such as `EVT-PAY-001` |
| Topic/Queue | Proposed or existing topic name |
| Producer | Service method and trigger timing |
| Consumer | Consumer module or job |
| Payload | Exact fields, idempotency key, version |
| Send Timing | After transaction commit, outbox, or existing project pattern |
| Delivery Semantics | At-least-once, ordered, delayed, or transactional if applicable |
| Consumer Idempotency | Unique key, processed table, status check, or Redis key |
| Retry | Retry count, interval, dead-letter, compensation |
| Failure Visibility | Log, alert, admin retry, or manual compensation |

Mainstream defaults:

- Assume at-least-once delivery and make consumers idempotent.
- Use business ID plus event type as the consumer idempotency key.
- Use outbox table or after-commit event publishing when message loss would break business consistency.
- Use delayed messages or scheduled retry for retryable external side effects.
- Do not put large payloads in messages; pass IDs and necessary snapshots.

## Transaction And Consistency

Each write flow should document:

- Transaction boundary and rollback rules.
- Tables written inside the transaction.
- Operations deliberately outside the transaction.
- Idempotency key and duplicate-submit behavior.
- Lock strategy when concurrent writes can corrupt state.
- Consistency model: strong consistency, eventual consistency, or read-your-write requirement.
- How cache invalidation and event publishing coordinate with commit.

Mainstream defaults:

- Keep one aggregate or one module's tables inside a local MySQL transaction.
- Avoid distributed transactions unless the existing platform already standardizes them.
- Prefer local transaction plus MQ/eventual consistency for cross-module side effects.
- Prefer optimistic locking for normal concurrent updates; use distributed locks only around business uniqueness, external calls, or hot critical sections where DB constraints are insufficient.

## Middleware Recommendation Matrix

Every backend module doc should include a middleware recommendation matrix:

| Middleware | Level | Scenario | Suggested Detail | Fallback |
| --- | --- | --- | --- | --- |
| Redis Cache | S1 / S2 / S3 / N/A | Query acceleration, dictionary, session, lock | Keys, TTL, invalidation | DB read, degraded response |
| Distributed Lock | S1 / S2 / S3 / N/A | Duplicate submit, state transition, inventory, payment | Lock key, timeout, owner | DB unique/optimistic lock |
| MQ/Event | S1 / S2 / S3 / N/A | Async integration, notification, eventual consistency | Topic, payload, retry | Outbox/manual compensation |
| Scheduled Job | S1 / S2 / S3 / N/A | Timeout close, retry, sync, cleanup | Cron, batch size, lock | Manual trigger |
| External Adapter | S1 / S2 / S3 / N/A | Third-party or cross-system call | Timeout, retry, fallback | Pending/retry state |
| Object Storage | S1 / S2 / S3 / N/A | File upload, attachment, export | Bucket/path, metadata | Retry/manual upload |
| Search Index | S1 / S2 / S3 / N/A | Complex search or large fuzzy query | Index fields, sync strategy | MySQL fallback |

## Performance And Capacity

When data volume, SLA, or frequent queries are relevant, document:

- Expected data size and growth assumption.
- Hot queries and recommended indexes.
- Pagination and maximum page size.
- Batch processing size and rate limits.
- Slow query risk and mitigation.
- Cache hit target when cache is used.
- Async processing throughput and retry pressure.
- Large export/import strategy.

## Security And Data Scope

Each module should document:

- Login/authentication requirement.
- Permission code or role.
- Tenant, merchant, organization, department, or owner data-scope rule.
- Sensitive fields and masking rule.
- Audit log and operation log fields.
- Input validation and anti-replay/idempotency behavior for write APIs.

## Observability And Operations

Each backend module should include observability guidance:

- Structured logs for key business IDs and error codes.
- Metrics: request count, latency, failure count, MQ lag, retry count, cache hit rate when relevant.
- Trace/span boundaries for external calls and async events when the project has tracing.
- Alerts for failed jobs, dead-letter messages, repeated external failures, or critical state stuck.
- Manual operation or admin retry entry when business compensation is needed.

## Documentation Rule

Backend方案 should not stop at high-level words like "use cache", "send MQ", or "add scheduled task". Provide suggested names, keys, payloads, triggers, retry rules, failure behavior, and consistency notes. If details are unknown, propose a mainstream default, assign a recommendation level, and mark it as an assumption for downstream skills to confirm.
