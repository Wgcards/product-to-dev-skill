---
name: product-to-dev-skill
description: 当业务人员或产品人员使用自然语言描述业务需求、页面交互、数据模型、系统设计或前后端方案时使用。该 skill 用于生成可部署的 React 前端工程、前端 mock 假数据对接、按业务模块拆分且可供后续 AI 直接开发的 Java 后端开发文档、REST 风格 HTTP 接口文档和 MySQL SQL 文件；后端只生成开发文档和接口文档，不直接生成 Java 实现代码。
---

# Product-to-Dev Skill

## Goal

Turn business, product, workflow, field-model, or system-design descriptions into reviewable and runnable delivery artifacts:

- React frontend project with realistic interactions and deployable build output.
- Mock-driven frontend services whose data shape matches the API documentation.
- Module-split Java backend development documentation, without Java implementation source files.
- Module-split REST-style HTTP API documentation.
- MySQL DDL SQL files that follow GX table rules.
- Handoff notes that business, product, frontend, backend, and QA can each use.

The bundled `assets/react-tailwind-template/` and `scripts/create_react_app.py` are the frontend submodule inherited from the previous business React app builder.

## Workflow

1. Classify the request.
   - Existing project: inspect the repo first and follow its framework, routing, request, mock, style, auth, menu, and permission conventions.
   - New frontend app: scaffold with `python3 scripts/create_react_app.py <target-dir> --name "<display name>"`.
   - Business requirement delivery: when a business or product user describes a requirement and does not explicitly limit scope, always produce the full delivery package: frontend code, mock data/services, Java backend development docs, REST API docs, MySQL SQL, verification notes, and handoff notes.
   - Partial delivery is an explicit exception only: when the user says "先出方案", "只写文档", "只要接口", "只要 SQL", "不要前端", "不要代码", or similar, generate only the requested artifact and state which full-delivery artifacts were intentionally skipped.
2. Build the delivery scope.
   - Read `references/intake-and-delivery.md` for vague, multi-role, or stakeholder-driven requests.
   - Split the work into business modules first, then split each module into frontend behavior, backend capabilities, API contracts, SQL tables, mock data, and handoff notes.
   - Ask only blocking questions. Otherwise make product-minded assumptions and list them after delivery.
3. Build or update the React frontend.
   - Read `references/frontend-react.md` before changing frontend architecture.
   - Read `references/mock-and-integration.md` before adding services, mock data, or real API switch points.
   - For frontend UI, UE, and UX design, use the companion `ui-ux-pro-max` skill when it is installed. If it is not installed or not available in the current Codex session, follow the local design references as fallback and tell the user to install UI UX Pro MAX through their standard skill installation process for stronger design guidance. Do not include installation steps unless the user asks for them.
   - Read `references/design-direction.md`, `references/tailwind-v4-system.md`, or `references/react-performance.md` only when visual direction, Tailwind tokens, or performance risk matters.
4. Generate backend and API documentation.
   - Read `references/module-documentation.md` before creating or reorganizing backend/API docs.
   - Read `references/backend-java-docs.md` for Java implementation guidance documents.
   - Read `references/backend-architecture.md` before writing backend module designs, middleware choices, cache strategy, MQ/event design, consistency rules, or industry-baseline technical方案.
   - Read `references/api-contracts.md` for REST endpoints, response wrappers, authorization, pagination, errors, and state transitions.
   - Produce one backend document and one API document per business module unless the target project has a stricter convention.
   - Mark every table used by each module, service method, and endpoint; include read/write purpose and SQL file path.
   - Write backend docs down to development-detail level: business logic, service method design, DTO/entity fields, cache keys and TTLs, MQ topics/events, scheduler jobs, middleware dependencies, transaction boundaries, consistency strategy, retries, locks, degradation, observability, and traceability links.
   - Keep backend function方案 aligned with mainstream Java/Spring enterprise practice unless an existing project convention says otherwise.
   - Treat generated docs as the recommended implementation baseline for later development skills. Include downstream-skill handoff notes with recommendation levels, rationale, and tradeoffs so another skill can decide the final implementation with project context.
   - Do not create Java Controller, Service, Mapper, Entity, Mapper XML, or implementation code unless the user explicitly changes this constraint.
5. Generate database SQL.
   - Read `references/database-mysql.md` before writing or modifying DDL.
   - Write all DDL into SQL files; do not leave table design only in chat.
   - Maintain one SQL file per module unless the target project already has a stronger convention.
6. Verify and hand off.
   - Read `references/delivery-verification.md` before the final response.
   - Run the narrowest useful checks, then broaden when shared setup, routing, or generated contracts changed.
   - After frontend changes, inspect in a browser or screenshot when the environment supports it.

## Default Artifact Map

- Frontend app: `frontend/`, `web/`, or the user-specified directory.
- Backend development docs: `docs/backend/<module-name>.md`; add `docs/backend/index.md` only when multiple modules need a navigation index.
- HTTP API docs: `docs/api/<module-name>.md`; add `docs/api/index.md` only when multiple modules need a navigation index.
- SQL files: `sql/<module-name>.sql`.
- Mock data: frontend `src/mocks/mock-data.ts` unless an existing project has a single mock-data convention.
- Mock or API services: frontend `src/services/` or the existing service directory.
- Real API switch helper: frontend `src/services/api-client.ts` when using the bundled template.
- Shared TypeScript DTO/VO types: frontend `src/types/`.

## Core Rules

- Treat business language as source material, not final UI copy. Rewrite it into concise labels, statuses, filters, actions, errors, and field names.
- Prefer concrete workflows over generic dashboards: actors, objects, statuses, decisions, exceptions, next actions, and audit signals.
- Use module-first documentation. Do not mix unrelated business domains in one backend or API document.
- Default to full-delivery for business requirements. Do not silently shrink a business requirement into frontend-only, docs-only, API-only, or SQL-only work unless the user explicitly scopes it down.
- Make backend/API docs detailed enough for a later AI agent to start implementation from them: describe complete business rules, state transitions, validations, transaction boundaries, tables, DTOs, endpoint contracts, and error behavior.
- Downstream skill handoff should be recommendation-oriented. Backend docs, API docs, and SQL should be self-contained and cross-linked, but later coding skills may adjust the方案 when project context requires it and should record the reason.
- Keep frontend data behind services; pages and components must not hardcode business records.
- Keep frontend mock structures, TypeScript types, API docs, and SQL semantics consistent.
- Use the unified API response wrapper `{ data, code, codeMsg }`; show `codeMsg` directly when `code` is not `"200"`.
- Use request header `authorization: <backend-token>` for auth; do not use cookies for frontend/backend auth in generated contracts.
- Do not introduce new dependencies unless they clearly reduce complexity or match the existing project.
- Use `interface` names with an `I` prefix and `type` aliases with a `T` prefix in TypeScript when creating new TypeScript code.
- Add concise Chinese comments to hand-written functions, components, complex branches, mock replacement points, and important TSX sections when comments help future implementers.

## Resource Map

- `scripts/create_react_app.py`: deterministic copier for the bundled Vite React TypeScript Tailwind v4 template.
- `assets/react-tailwind-template/`: frontend starter with centralized mock data, mock/real API switch helper, services, types, and operational UI components.
- `references/intake-and-delivery.md`: requirement intake, scope split, question policy, and artifact planning.
- `references/module-documentation.md`: module splitting, AI-readable documentation style, traceability, and implementation-ready doc rules.
- `references/frontend-react.md`: frontend project, interaction, typing, UI, and old React-builder submodule rules.
- `references/mock-and-integration.md`: mock data, service layer, unified response, and real API switch guidance.
- Companion skill `ui-ux-pro-max`: preferred design intelligence for frontend UI/UE/UX, layouts, components, typography, colors, charts, UX patterns, and stack-specific frontend best practices.
- `references/backend-architecture.md`: mainstream Java backend方案, middleware, cache, MQ, consistency, performance, and observability baselines.
- `references/backend-java-docs.md`: Java backend documentation structure and depth requirements.
- `references/api-contracts.md`: REST HTTP API documentation rules and endpoint template.
- `references/database-mysql.md`: GX MySQL DDL standards and SQL self-check.
- `references/delivery-verification.md`: verification, directory, boundary, and final response checklist.
