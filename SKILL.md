---
name: product-to-dev-skill
description: 当业务人员或产品人员用自然语言描述业务需求、页面交互、数据模型、系统设计、接口设计或数据库设计，并需要转成可运行前端、mock 契约、后端开发文档、API 文档或 SQL 交付物时使用；该 skill 用于按 Web SPA、Web SSR/BFF 或 App placeholder 路由前端范围，生成可部署 Web 前端工程、前端 mock 假数据对接、按业务模块拆分且可供后续 AI 直接开发的 Java 后端开发文档、REST 风格 HTTP 接口文档和 MySQL SQL 文件；后端只生成开发文档和接口文档，不直接生成 Java 实现代码。
---

# Product-to-Dev Skill

## Goal

Turn business, product, workflow, field-model, or system-design descriptions into reviewable and runnable delivery artifacts:

- Web React frontend project with realistic interactions, Prism/OpenAPI mock support, environment modes, i18n, and deployable build output; choose Vite SPA or Next.js SSR/BFF by B-side/C-side product surface and rendering needs. App lane is currently a placeholder for mobile scope routing and handoff, not a runnable App scaffold.
- Mock-driven frontend services whose data shape matches OpenAPI, API docs, DTOs, and SQL semantics.
- Module-split Java backend development documentation, without Java implementation source files.
- Module-split REST-style HTTP API documentation.
- MySQL DDL SQL files that follow GX table rules.
- Handoff notes that business, product, frontend, backend, and QA can each use.

The bundled `assets/react-tailwind-template/` and `scripts/create_react_app.py` are the frontend submodule inherited from the previous business React app builder. They are for SPA-style Vite React delivery. New SPA projects must follow the current standard even while the template is being migrated: MUI first, Prism + OpenAPI mock, unified APIClient, layered env files, feature/shared architecture, DTOs under `src/types/dto/`, and `i18next` locale files. SSR projects follow the top-level `references/ssr-*.md` rules for Next.js App Router, BFF boundaries, contracts, cache, and verification. App projects are routed through `references/app-frontend-architecture.md` as a placeholder until the App references and assets are completed; do not use the SPA or SSR templates to scaffold App projects. Existing or rebuilt frontend projects still use MUI-first for newly developed Web capabilities; only pre-existing complex UI surfaces may keep their current implementation when MUI migration cannot preserve visual and interaction parity.

## Frontend Spec Route

Before scaffolding, migrating, or implementing any frontend surface, route the work to the SPA lane, SSR lane, or App lane. For mixed products, classify each route group, page surface, or client surface independently and include the route map in handoff.

- SPA lane: use for B-side/internal operational tools, admin consoles, seller centers, CRM, configuration panels, enterprise account tools, and existing Vite SPA projects without approved migration. Load `references/frontend-react.md`, `references/frontend-architecture.md`, and the normal SPA references required by the requested work.
- SSR lane: use for C-side public pages, storefront/product/category/search/content/detail pages, marketing entry pages, shareable pages, SEO/metadata/Open Graph/sitemap/robots needs, server-prefetch-heavy pages, BFF gateway needs, webhook/external REST boundaries, or Next.js App Router projects. Load `references/ssr-frontend-architecture.md`, `references/ssr-delivery-workflow.md`, and only the topic-specific `references/ssr-*.md` files required by the route.
- App lane: use for iOS/Android App, React Native, Expo, native device capabilities, offline sync, push notifications, deep links, app release, or mobile-client-specific navigation and storage needs. Current status is placeholder: load `references/app-frontend-architecture.md`, classify and document scope, but do not scaffold or claim App compliance until the App references/assets are completed.
- Existing-project lane: existing architecture wins until the user approves migration. If the project is Vite SPA, route new work to SPA references; if it is Next.js App Router or already has BFF/SSR boundaries, route new work to SSR references; if it is React Native, Expo, native mobile, or mobile-app-specific, route new work to App lane and target-project conventions; if it is mixed, produce a per-surface matrix before broad changes.
- Mixed route map: public `/`, product, category, content, search, marketing, share, sitemap, robots, metadata, and OG routes usually follow SSR; authenticated admin, console, CRM, settings, bulk operation, and back-office workflow routes usually follow SPA unless the existing shell is Next.js or SSR has explicit value.
- Mixed client map: iOS/Android app surfaces, offline workflows, push/deep-link entry points, native permissions, mobile local storage, and app release workflows follow App lane even when the same product also has Web SPA or SSR surfaces.
- User override: if the user explicitly asks for SPA, SSR, or App against the default route, follow the request, record the tradeoff, and still load the selected lane's references.

## Workflow

0. Verify required skill references.
   - Before delivery work, identify the reference files required by the selected workflow path and verify that each file exists and is readable.
   - If any required `references/*.md` file is missing or unreadable, report the exact path, explain which delivery scope is affected, and continue only with an explicit fallback. If the missing reference blocks the delivery decision, stop and ask for confirmation.
   - Do not claim that a referenced rule was followed unless the corresponding file was actually available or a fallback was explicitly stated.
1. Classify the request.
   - Existing project: inspect the repo first and identify its framework, UI library, routing, request wrapper, mock system, env files, i18n, auth, menu, permission model, package manager, and directory conventions.
   - If an existing project diverges from this skill's new standard, explain the current convention, target convention, impacted directories/dependencies/scripts/configs/call chains, risks, verification scope, and developer-habit impact before migrating.
   - For existing or rebuilt projects, produce a migration status matrix before broad changes. Cover UI library, visual parity risk, routing, request wrapper, mock/OpenAPI/Prism, env modes, i18n, DTO placement, feature/shared architecture, docs/api, docs/backend, SQL, package manager, and quality tooling. Mark each item as `compliant`, `migrated`, `compatible-exception`, or `non-compliant`; do not silently finish with `non-compliant` items.
   - If the user declines a migration in the current project, continue with the existing convention for later work in that project unless the user explicitly reopens the migration.
   - For a new frontend app or route group, use Frontend Spec Route first. B-side/internal Web tools default to SPA unless SSR has clear value; C-side public, SEO, shareable, content/product, storefront, or server-prefetch-heavy Web surfaces default to SSR/BFF evaluation; iOS/Android, React Native, Expo, native capability, offline, push, deep-link, or app-release scopes default to App lane.
   - New SPA frontend app: scaffold with `python3 scripts/create_react_app.py <target-dir> --name "<display name>"`, then bring the generated project up to the current standard before treating it as done.
   - New SSR frontend app: do not use the Vite SPA template as the starting point. Read `references/ssr-frontend-architecture.md` and `references/ssr-delivery-workflow.md`, then create or adapt a Next.js App Router structure that preserves `src/app`, `src/bff`, `src/features`, `src/shared`, and `mock` boundaries.
   - New App frontend scope: read `references/app-frontend-architecture.md` and treat the App lane as placeholder. Do not create a React Native/Expo app from this skill's Web templates. If the user explicitly asks to implement before App references are completed, confirm target stack and target-project conventions, then use available React Native / Expo companion skills as implementation guidance and document that this skill's App lane is not complete.
   - Business requirement delivery: when a business or product user describes a requirement and does not explicitly limit scope, always produce the full delivery package: frontend code, mock data/services, Java backend development docs, REST API docs, MySQL SQL, verification notes, and handoff notes.
   - Partial delivery is an explicit exception only: when the user says "先出方案", "只写文档", "只要接口", "只要 SQL", "不要前端", "不要代码", or similar, generate only the requested artifact and state which full-delivery artifacts were intentionally skipped.
2. Build the delivery scope.
   - Read `references/intake-and-delivery.md` for vague, multi-role, or stakeholder-driven requests.
   - Split the work into business modules first, then split each module into frontend behavior, backend capabilities, API contracts, SQL tables, mock data, and handoff notes.
   - Ask only blocking questions. Otherwise make product-minded assumptions and list them after delivery.
3. Build or update the frontend.
   - Route the frontend scope to SPA, SSR, or App before loading detailed frontend references; do not mix SPA, SSR, and App rules without an explicit per-surface matrix.
   - For SPA delivery, read `references/frontend-react.md` before changing frontend architecture.
   - For SPA delivery, read `references/frontend-architecture.md` before adding feature/shared directories, APIClient, DTOs, hooks, or component splits.
   - For SSR / Next.js App Router delivery, read `references/ssr-frontend-architecture.md` before changing architecture, then load the specific `references/ssr-*.md` file required by routing/RSC, BFF, contracts/mock, cache/performance, delivery, or verification work.
   - For App delivery or App-scoped intake, read `references/app-frontend-architecture.md`. While it remains placeholder, only classify scope, list assumptions and gaps, and avoid claiming runnable App delivery unless the target project and companion App skills provide the implementation standard.
   - For SSR / BFF logging, unified logger packages, local/production transports, client console removal, PM2 logging, request id propagation, trace context, Web Vitals, client errors, audit events, or log redaction, read `references/ssr-observability-and-logging.md`.
   - For SSR / BFF security headers, cookies, CSRF, CORS, runtime validation, redirects, uploads/downloads, source maps, or private-data cache behavior, read `references/ssr-security-baseline.md`.
   - For SSR / BFF environment variables, server/client config boundaries, secret injection, feature flags, base URLs, PM2 env, mock/dev/test/prod switching, or config validation, read `references/ssr-runtime-config.md`.
   - For SSR / BFF i18n, next-intl, language switching, locale context, metadata copy, BFF locale headers, or locale-aware cache keys, read `references/ssr-i18n.md`.
   - Read `references/store.md` before adding Zustand, global stores, feature stores, persisted state, auth/session state, locale/currency state, or APIClient runtime-context wiring.
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
   - Run the narrowest useful checks, then broaden when shared setup, routing, or generated contracts changed. Dependency-resolution, typecheck, lint, format, OpenAPI/mock checks, build, or dev/mock smoke failures are delivery blockers unless the user explicitly asks for a partial artifact.
   - When the user asks to start the frontend project, inspect package scripts first: if Prism/OpenAPI mock support exists and `dev:mock` is available, run `dev:mock`; otherwise run the project's normal `dev` or `dev:dev` script.
   - After starting a frontend project, if multi-environment config exists and package scripts expose matching dev-mode commands such as `dev:mock`, `dev:dev`, `dev:test`, or scripts using `--mode <env>`, tell the caller every environment's start command and identify which environment was started.
   - After frontend changes, inspect in a browser or screenshot when the environment supports it.

## Default Artifact Map

- Frontend app: `frontend/`, `web/`, or the user-specified directory.
- SSR frontend app: Next.js App Router with `src/app`, `src/bff`, `src/features`, `src/shared`, `src/types/dto`, `src/locale`, and `mock` boundaries, unless the target project has an equivalent stricter convention.
- App frontend scope: no default scaffold yet. Use `app/`, `mobile/`, `apps/mobile/`, or the target-project convention only after App lane requirements are clarified; record placeholder status in handoff.
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
- For existing or rebuilt projects, MUI-first still applies to newly developed capabilities and newly added interaction surfaces. The exception is limited to pre-existing complex UI being refactored: if replacing custom or legacy UI with MUI would make styling, layout, animation, responsive behavior, or brand fidelity worse, keep the existing implementation and record a `compatible-exception`.
- Dialogs, drawers, snackbar feedback, forms, tables, tabs, pagination, tooltips, chips, and badges should use MUI components in new projects and for newly developed capabilities in existing/rebuilt projects. Existing complex surfaces may keep their current components only when MUI cannot preserve established styling or interactions.
- Keep frontend data behind feature services/hooks. Pages and components must not hardcode business records, call `fetch` directly, or assemble base URLs.
- Choose SPA, SSR, or App explicitly before building. B-side/internal Web operational tools usually use SPA; C-side public Web storefront/content/product/search/share pages use SSR/BFF when SEO, metadata, server-side data, cache, or first-screen performance matters; iOS/Android/native capability/offline/push/deep-link/release scopes use App lane.
- SSR/BFF projects must keep server-only backend access behind BFF gateway/service/adapter boundaries; Client Components must not import server-only modules, backend SDKs, Node APIs, or server environment variables.
- App lane is currently a placeholder. Do not claim App lane compliance, scaffold mobile apps, or reuse Web SPA/SSR templates for App unless the user explicitly approves a target stack and the target project or companion App skills provide the implementation standard.
- All user-visible frontend copy must be locale-backed by default. Do not hardcode UI copy in pages, components, hooks, services, APIClient/request wrappers, helpers, stores, constants, or mock fixtures, except brand names, product names, third-party proper nouns, protocol values, comments, logs, and test descriptions.
- Runtime mock interfaces must go through Prism. Service, hook, page, APIClient, or component code must not return hardcoded mock response objects such as `{ data, code, codeMsg }` for a real HTTP/mock endpoint. Fixtures may support tests, stories, static examples, or OpenAPI example generation, but they must not be the normal runtime fallback for mock mode.
- Treat `mock/openapi.yaml` as the source of truth for implemented frontend/API contracts. Every implemented frontend service method must map to an OpenAPI path and `operationId`; every API doc endpoint marked implemented must exist in OpenAPI. Future endpoints in API docs must be marked `Planned`, `Not implemented in frontend`, or `Not available in Prism mock`.
- OpenAPI schemas for frontend-consumed data must be strict enough to catch drift. Do not use broad `type: object` plus `additionalProperties: true` for consumed objects or array items unless the field is intentionally an extension bag and the reason is documented.
- Keep OpenAPI schemas/examples, frontend DTOs, service fields, API docs, mock behavior, and SQL semantics consistent. Required/optional fields, enums, error codes, state transitions, and example payloads must match across these artifacts.
- Use the unified API response wrapper `{ data, code, codeMsg }`; show `codeMsg` directly when `code` is not `"200"`. In remote/mock/dev/test/prod modes, APIClient must reject or normalize as a contract error when a response omits this wrapper; do not silently wrap raw payloads as success responses.
- Backend-provided `codeMsg` may be displayed directly when backend i18n is part of the contract. Frontend-generated fallback `codeMsg`, validation messages, Snackbar text, empty/loading/error states, aria labels, placeholders, and mock display copy must come from locale dictionaries or a documented locale-aware API/mock source.
- Use request header `authorization: <backend-token>` for backend-facing contracts. SPA browser-to-backend calls send the header directly. SSR/BFF projects may use httpOnly same-origin cookies between browser and BFF, but the BFF must convert that session to backend authorization headers and must never expose tokens to Client Component props or JSON responses.
- New Web projects must generate Prism/OpenAPI mock support, MUI dependencies, `i18next`/`react-i18next`, and the agreed quality-tooling baseline. App lane keeps these as contract/handoff considerations until App references define the concrete mobile stack. Existing projects only receive new tooling after compatibility assessment or user approval.
- New frontend projects default to `pnpm`. Existing frontend projects must keep their current package manager unless the user explicitly approves a package-manager migration.
- If a project has Prism/OpenAPI mock support and exposes `dev:mock`, use `dev:mock` as the default start command when the user asks to run the project; fall back to `dev` or `dev:dev` only when `dev:mock` is absent or the user explicitly requests another mode.
- When multi-environment dev scripts exist, surface the full command map to the caller after startup, for example `mock -> pnpm dev:mock`, `dev -> pnpm dev:dev`, and `test -> pnpm dev:test`, so the caller can confirm the active environment is expected.
- If a required `references/*.md` file named by this skill is unavailable in the current checkout, stop and report the skill installation/checkout problem before claiming that the referenced rules were followed.
- Frontend imports must not use parent relative paths such as `../` or `../../../`. Only same-directory imports like `./local-file` may stay relative; all cross-directory application imports must use the configured alias such as `@/features/...`, with TypeScript and build/test/lint tooling resolving the same alias.
- Use `interface` names with an `I` prefix and `type` aliases with a `T` prefix in TypeScript when creating new TypeScript code.
- Add concise Chinese comments to newly created or modified hand-written code where the comment explains responsibility, business meaning, boundary behavior, or future replacement points.
- Comment exported functions, hooks, components, request/runtime wrappers, shared utilities, non-obvious formatters, complex branches, state transitions, compatibility logic, mock replacement points, and important TSX/Vue template sections.
- For TypeScript `interface`, `type`, enum, and DTO fields, add business-meaning comments when the shape is API-facing, cross-module, or not immediately obvious. Include enum value meaning, units, formats, optional conditions, and value ranges when relevant.
- Prefer short multi-line Chinese comments for functions, hooks, components, and type fields so editor hover text is useful.
- Do not add noisy comments to purely decorative nodes, obvious one-line local variables, trivial JSX wrappers, generated files, lock files, binary assets, or third-party/vendor code.
- If the target project has stricter comment rules, follow the stricter project rules and mention any unavoidable gap in the final handoff.

## Resource Map

- `scripts/create_react_app.py`: deterministic copier for the bundled Vite React TypeScript Tailwind v4 template.
- `assets/react-tailwind-template/`: legacy frontend starter being migrated toward MUI, Prism/OpenAPI, APIClient, env, i18n, and quality-tooling defaults.
- `references/intake-and-delivery.md`: requirement intake, scope split, question policy, and artifact planning.
- `references/module-documentation.md`: module splitting, AI-readable documentation style, traceability, and implementation-ready doc rules.
- `references/frontend-react.md`: React project, MUI interaction, typing, UI, and existing-project compatibility rules.
- `references/frontend-architecture.md`: feature/shared architecture, APIClient, hooks, DTO placement, and component split rules.
- `references/ssr-frontend-architecture.md`: Next.js App Router SSR/BFF baseline, boundaries, and delivery gates.
- `references/ssr-delivery-workflow.md`: B-side/C-side SPA-vs-SSR selection, SSR intake, layout, migration matrix, delivery steps, and handoff matrix.
- `references/ssr-routing-and-rsc.md`: App Router ownership, Server/Client Component boundaries, Route Handlers, Server Actions, metadata, images, fonts, and scripts.
- `references/ssr-ui-runtime.md`: MUI SSR positioning, Emotion/cache provider, ThemeProvider, CSS layer, Tailwind coexistence, theme hydration, icon and UI bundle rules.
- `references/ssr-bff-boundaries.md`: BFF gateway/service/adapter/route/action boundaries, auth/session mapping, legacy constraints, and backend-gap handling.
- `references/ssr-contracts-and-mock.md`: SSR endpoint ids, OpenAPI/Prism parity, DTO placement, adapter rules, and API documentation linkage.
- `references/ssr-cache-and-performance.md`: rendering mode, revalidation, waterfall prevention, RSC serialization, bundle, server runtime, and hydration rules.
- `references/ssr-observability-and-logging.md`: unified logger layer, local/production and client/server logging behavior, request id propagation, normal/API log schemas, upstream summaries, production client console removal, PM2 logging, Web Vitals, client errors, audit events, and redaction rules.
- `references/ssr-security-baseline.md`: security headers, cookies/session, CSRF, CORS, input validation, XSS sinks, redirects, uploads/downloads, authorization, source maps, and private-data cache rules.
- `references/ssr-runtime-config.md`: environment classes, server/client config boundaries, secret handling, config validation, feature flags, service base URLs, PM2 env, and diagnostics.
- `references/ssr-i18n.md`: next-intl, no-locale-route policy, locale source, language-switch refresh flow, loading state, BFF locale propagation, localized metadata/errors, and locale-aware cache rules.
- `references/ssr-verification.md`: SSR typecheck/build/mock/boundary/runtime/browser verification and handoff evidence.
- `assets/ssr/`: SSR examples and templates used by the SSR lane.
- `references/app-frontend-architecture.md`: App lane placeholder for iOS/Android, React Native, Expo, native capabilities, offline, push, deep links, app release, and future App references/assets routing.
- `assets/app/`: App examples and templates placeholder; no runnable App assets are provided yet.
- `references/store.md`: Zustand store ownership, persistence, global/domain/component state boundaries, and APIClient runtime context rules.
- `references/mock-and-integration.md`: Prism/OpenAPI mock, service layer, unified response, examples, and real API switch guidance.
- `references/i18n.md`: i18next/react-i18next setup and self-contained locale dictionary sync workflow.
- `references/quality-tooling.md`: ESLint, Prettier, EditorConfig, Commitlint, Husky, lint-staged, and check scripts.
- Companion skill `ui-ux-pro-max`: preferred design intelligence for frontend UI/UE/UX, layouts, components, typography, colors, charts, UX patterns, and stack-specific frontend best practices.
- `references/backend-architecture.md`: mainstream Java backend方案, middleware, cache, MQ, consistency, performance, and observability baselines.
- `references/backend-java-docs.md`: Java backend documentation structure and depth requirements.
- `references/api-contracts.md`: REST HTTP API documentation rules and endpoint template.
- `references/database-mysql.md`: GX MySQL DDL standards and SQL self-check.
- `references/delivery-verification.md`: verification, directory, boundary, and final response checklist.
