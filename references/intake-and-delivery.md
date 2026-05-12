# Intake And Delivery

## Business Brief Shape

Convert the user's description into these fields before coding or writing docs:

- Audience: who uses the system and how often.
- Job: the decision, operation, approval, reporting, or execution task the system supports.
- Objects: orders, leads, approvals, tickets, SKUs, invoices, files, accounts, projects, or other business entities.
- States: draft, pending, submitted, approved, rejected, blocked, fulfilled, overdue, at risk, completed, archived.
- Actions: create, edit, assign, approve, reject, submit, sync, export, compare, follow up, close, retry, compensate.
- Signals: metrics, freshness, exceptions, SLA, risk, priority, owner, audit trail, next step.
- Constraints: brand, device, language, auth, tenant, organization, data source, external systems, deadline, must-have screens.

If the user gives enough context to make a useful first version, do not ask for a full PRD. Make reasonable assumptions and list them after delivery.

## Scope Split

Split every direct implementation request into business modules first, then five delivery lanes inside each module:

- Frontend interaction: pages, routes, components, forms, tables, filters, details, state actions, confirmations, feedback, loading, empty, and error states.
- Backend capability: Java module boundary, domain services, business rules, validation, transactions, idempotency, status machine, cache, MQ/events, scheduled jobs, distributed locks, external adapters, middleware choices, logs, observability, and permissions.
- API contract: resource paths, methods, request/response DTOs, pagination, sorting, filtering, error codes, auth, examples, and state transition rules.
- Data model: MySQL tables, fields, indexes, unique constraints, audit fields, logical deletion, enum comments, initialization data, and DDL changes.
- Mock and handoff: local mock data, mock services, real API replacement notes, assumptions, run commands, build commands, and remaining integration work.

## Module Split

Identify modules by business capability, not by technical layer. Good module names are concrete nouns or workflows:

- `payment-order`: payment order creation, review, payment status, detail records, attachments.
- `approval-flow`: approval submission, callback, approval state sync, rejection handling.
- `customer-account`: customer profiles, account validation, account status, account risk.
- `file-management`: upload metadata, attachment binding, file lookup.
- `config-dict`: dictionary and configurable option maintenance.

For each module, record:

- Module ID and Chinese name.
- Primary actor and business owner.
- Pages or frontend surfaces.
- API list.
- Backend service responsibilities.
- Tables used with access mode.
- SQL file path.
- Cross-module dependencies.

## Question Policy

Ask one concise clarification only when one of these is blocking:

- The target user or core workflow is unknown.
- The app type is ambiguous between dashboard, form system, approval workflow, CRM, reporting tool, or public website.
- A requested integration needs credentials, an API contract, a production URL, or irreversible production behavior.
- A database model conflict would change core business meaning.
- A destructive edit would overwrite user work.

Otherwise proceed with defaults:

- App language follows the user's language.
- Frontend uses mock data until a real backend contract or source is provided.
- New SPA projects use Vite + React + TypeScript.
- UI is desktop-first and mobile-safe unless the user asks for mobile-first.
- Operational products use restrained business UI rather than marketing composition.

## Delivery Planning

For business or product requirement descriptions, default to a full research-and-development handoff package unless the user explicitly narrows the scope. Full-delivery is the normal path, not an optional expansion.

Default deliverables are:

- Runnable React frontend project.
- Page, route, component, and interaction notes.
- Mock API implementation aligned with API docs.
- Java backend development documentation.
- REST-style HTTP API documentation.
- MySQL SQL file for table creation or alteration.
- Handoff notes explaining mock-to-real API replacement.

When the user explicitly says "先出方案", "只写文档", "只要接口", "只要 SQL", "不要前端", "不要写代码", or similar, limit output to the requested artifact and mention which full-delivery artifacts were intentionally skipped.

## Iteration Mapping

Map common business feedback to concrete changes:

- "指标不对": update metric definitions, labels, sample values, API fields, mock data, and SQL field semantics if needed.
- "流程是另一个顺序": update workflow stages, allowed state transitions, action labels, API state-change docs, and mock transition behavior.
- "给销售/运营/财务用": adjust navigation, entity names, KPI hierarchy, table columns, backend module language, and permissions.
- "要能筛选/搜索": add controlled UI state, service query params, mock filtering, API query docs, empty state, and SQL/index review.
- "换个风格": change tokens and composition first; avoid repainting each component ad hoc.
- "接接口": keep the service method names, replace mock implementation centrally, handle loading/error/empty/stale/partial data states.
