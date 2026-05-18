---
name: product-to-dev-skill
description: 当业务人员或产品人员用自然语言描述业务需求、页面交互、数据模型、系统设计、接口设计或数据库设计，并需要转成可运行前端、mock 契约、后端开发文档、API 文档或 SQL 交付物时使用；该 skill 用于生成可部署的 React 前端工程、前端 mock 假数据对接、按业务模块拆分且可供后续 AI 直接开发的 Java 后端开发文档、REST 风格 HTTP 接口文档和 MySQL SQL 文件；后端只生成开发文档和接口文档，不直接生成 Java 实现代码。
---

# Product-to-Dev Skill

## Goal

Turn business, product, workflow, field-model, or system-design descriptions into reviewable and runnable delivery artifacts:

- React frontend project with realistic MUI interactions, Prism/OpenAPI mock support, environment modes, i18n, and deployable build output.
- Mock-driven frontend services whose data shape matches OpenAPI, API docs, DTOs, and SQL semantics.
- Module-split Java backend development documentation, without Java implementation source files.
- Module-split REST-style HTTP API documentation.
- MySQL DDL SQL files that follow GX table rules.
- Handoff notes that business, product, frontend, backend, and QA can each use.

The bundled `assets/react-tailwind-template/` and `scripts/create_react_app.py` are the frontend submodule inherited from the previous business React app builder. New projects must follow the current standard even while the template is being migrated: MUI first, Prism + OpenAPI mock, unified APIClient, layered env files, feature/shared architecture, DTOs under `src/types/dto/`, and `i18next` locale files.

## Workflow

1. Classify the request.
   - Existing project: inspect the repo first and identify its framework, UI library, routing, request wrapper, mock system, env files, i18n, auth, menu, permission model, package manager, and directory conventions.
   - If an existing project diverges from this skill's new standard, explain the current convention, target convention, impacted directories/dependencies/scripts/configs/call chains, risks, verification scope, and developer-habit impact before migrating.
   - If the user declines a migration in the current project, continue with the existing convention for later work in that project unless the user explicitly reopens the migration.
   - New frontend app: scaffold with `python3 scripts/create_react_app.py <target-dir> --name "<display name>"`, then bring the generated project up to the current standard before treating it as done.
   - Business requirement delivery: when a business or product user describes a requirement and does not explicitly limit scope, always produce the full delivery package: frontend code, mock data/services, Java backend development docs, REST API docs, MySQL SQL, verification notes, and handoff notes.
   - Partial delivery is an explicit exception only: when the user says "先出方案", "只写文档", "只要接口", "只要 SQL", "不要前端", "不要代码", or similar, generate only the requested artifact and state which full-delivery artifacts were intentionally skipped.
2. Build the delivery scope.
   - Read `references/intake-and-delivery.md` for vague, multi-role, or stakeholder-driven requests.
   - Split the work into business modules first, then split each module into frontend behavior, backend capabilities, API contracts, SQL tables, mock data, and handoff notes.
   - Ask only blocking questions. Otherwise make product-minded assumptions and list them after delivery.
3. Build or update the React frontend.
   - Read `references/frontend-react.md` before changing frontend architecture.
   - Read `references/frontend-architecture.md` before adding feature/shared directories, APIClient, DTOs, hooks, or component splits.
   - Read `references/mock-and-integration.md` before adding services, mock data, OpenAPI examples, Prism behavior, or real API switch points.
   - Read `references/api-contracts.md` before creating OpenAPI or API docs.
   - Read `references/i18n.md` before adding or syncing locale files.
   - Read `references/quality-tooling.md` before creating lint, format, commit, or editor tooling.
   - For frontend UI, UE, and UX design, use the companion `ui-ux-pro-max` skill when it is installed. If it is not installed or not available in the current Codex session, follow the local design references as fallback and tell the user to install UI UX Pro MAX through their standard skill installation process for stronger design guidance. Do not include installation steps unless the user asks for them.
   - Read `references/design-direction.md`, `references/tailwind-v4-system.md`, or `references/react-performance.md` only when visual direction, Tailwind/MUI styling boundaries, or performance risk matters.
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
   - When the user asks to start the frontend project, inspect package scripts first: if Prism/OpenAPI mock support exists and `dev:mock` is available, run `dev:mock`; otherwise run the project's normal `dev` or `dev:dev` script.
   - After starting a frontend project, if multi-environment config exists and package scripts expose matching dev-mode commands such as `dev:mock`, `dev:dev`, `dev:test`, or scripts using `--mode <env>`, tell the caller every environment's start command and identify which environment was started.
   - After frontend changes, inspect in a browser or screenshot when the environment supports it.

## Default Artifact Map

- Frontend app: `frontend/`, `web/`, or the user-specified directory.
- Backend development docs: `docs/backend/<module-name>.md`; add `docs/backend/index.md` only when multiple modules need a navigation index.
- HTTP API docs: `docs/api/<module-name>.md`; add `docs/api/index.md` only when multiple modules need a navigation index.
- SQL files: `sql/<module-name>.sql`.
- Prism mock contract: frontend or project root `mock/openapi.yaml`, with schemas/requestBodies/responses/parameters under `mock/components/` and examples under `mock/examples/`.
- Mock or API services: feature service directories or the existing service directory; all methods must map to `mock/openapi.yaml` operations.
- Real API switch helper: `src/shared/tools/APIClient` for new template projects, or the existing request wrapper after compatibility assessment.
- Shared TypeScript DTOs: `src/types/dto/`.
- Locale files: `src/locale/zh-CN.json` and `src/locale/en-US.json`.

## Core Rules

- Treat business language as source material, not final UI copy. Rewrite it into concise labels, statuses, filters, actions, errors, and field names.
- Prefer concrete workflows over generic dashboards: actors, objects, statuses, decisions, exceptions, next actions, and audit signals.
- Use module-first documentation. Do not mix unrelated business domains in one backend or API document.
- Default to full-delivery for business requirements. Do not silently shrink a business requirement into frontend-only, docs-only, API-only, or SQL-only work unless the user explicitly scopes it down.
- Make backend/API docs detailed enough for a later AI agent to start implementation from them: describe complete business rules, state transitions, validations, transaction boundaries, tables, DTOs, endpoint contracts, and error behavior.
- Downstream skill handoff should be recommendation-oriented. Backend docs, API docs, and SQL should be self-contained and cross-linked, but later coding skills may adjust the方案 when project context requires it and should record the reason.
- For new projects, use MUI as the default component system. Use MUI primitives first, then feature-level wrappers, and only use custom components when MUI does not match the business shape.
- Dialogs, drawers, snackbar feedback, forms, tables, tabs, pagination, tooltips, chips, and badges should use MUI components in new projects.
- Keep frontend data behind feature services/hooks. Pages and components must not hardcode business records, call `fetch` directly, or assemble base URLs.
- Keep OpenAPI schemas/examples, frontend DTOs, service fields, API docs, mock behavior, and SQL semantics consistent.
- Use the unified API response wrapper `{ data, code, codeMsg }`; show `codeMsg` directly when `code` is not `"200"`.
- Use request header `authorization: <backend-token>` for auth; do not use cookies for frontend/backend auth in generated contracts.
- New projects must generate Prism/OpenAPI mock support, MUI dependencies, `i18next`/`react-i18next`, and the agreed quality-tooling baseline. Existing projects only receive these after compatibility assessment or user approval.
- New frontend projects default to `pnpm`. Existing frontend projects must keep their current package manager unless the user explicitly approves a package-manager migration.
- If a project has Prism/OpenAPI mock support and exposes `dev:mock`, use `dev:mock` as the default start command when the user asks to run the project; fall back to `dev` or `dev:dev` only when `dev:mock` is absent or the user explicitly requests another mode.
- When multi-environment dev scripts exist, surface the full command map to the caller after startup, for example `mock -> pnpm dev:mock`, `dev -> pnpm dev:dev`, and `test -> pnpm dev:test`, so the caller can confirm the active environment is expected.
- Frontend imports must not use parent relative paths such as `../` or `../../../`. Only same-directory imports like `./local-file` may stay relative; all cross-directory application imports must use the configured alias such as `@/features/...`, with TypeScript and build/test/lint tooling resolving the same alias.
- Use `interface` names with an `I` prefix and `type` aliases with a `T` prefix in TypeScript when creating new TypeScript code.
- Add concise Chinese comments to hand-written functions, components, complex branches, mock replacement points, and important TSX sections when comments help future implementers.

## Resource Map

- `scripts/create_react_app.py`: deterministic copier for the bundled Vite React TypeScript Tailwind v4 template.
- `assets/react-tailwind-template/`: legacy frontend starter being migrated toward MUI, Prism/OpenAPI, APIClient, env, i18n, and quality-tooling defaults.
- `references/intake-and-delivery.md`: requirement intake, scope split, question policy, and artifact planning.
- `references/module-documentation.md`: module splitting, AI-readable documentation style, traceability, and implementation-ready doc rules.
- `references/frontend-react.md`: React project, MUI interaction, typing, UI, and existing-project compatibility rules.
- `references/frontend-architecture.md`: feature/shared architecture, APIClient, hooks, DTO placement, and component split rules.
- `references/mock-and-integration.md`: Prism/OpenAPI mock, service layer, unified response, examples, and real API switch guidance.
- `references/i18n.md`: i18next/react-i18next setup and self-contained locale dictionary sync workflow.
- `references/quality-tooling.md`: ESLint, Prettier, EditorConfig, Commitlint, Husky, lint-staged, and check scripts.
- Companion skill `ui-ux-pro-max`: preferred design intelligence for frontend UI/UE/UX, layouts, components, typography, colors, charts, UX patterns, and stack-specific frontend best practices.
- `references/backend-architecture.md`: mainstream Java backend方案, middleware, cache, MQ, consistency, performance, and observability baselines.
- `references/backend-java-docs.md`: Java backend documentation structure and depth requirements.
- `references/api-contracts.md`: REST HTTP API documentation rules and endpoint template.
- `references/database-mysql.md`: GX MySQL DDL standards and SQL self-check.
- `references/delivery-verification.md`: verification, directory, boundary, and final response checklist.
