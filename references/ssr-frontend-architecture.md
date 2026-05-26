# SSR Frontend Architecture Rules

## Scope

本规则用于基于 `product-to-dev-skill` 生成或改造 SSR / Next.js App Router 前端项目。它不替代既有项目规范；当目标项目已有更严格的目录、BFF、契约或测试门禁时，按目标项目执行。

## Required Reading

- 改 `src/app`、RSC、Client Component、Route Handler、Server Action、metadata、image/font/script 前，读 `references/ssr-routing-and-rsc.md`。
- 改 MUI SSR、Emotion/cache provider、ThemeProvider、CSS layer、Tailwind 共存、暗色模式防闪烁或 MUI client leaf 边界前，读 `references/ssr-ui-runtime.md`。
- 改 BFF、鉴权上下文、gateway、adapter、service、route facade 或 Server Action 编排前，读 `references/ssr-bff-boundaries.md`。
- 改 OpenAPI、Prism mock、DTO、endpoint id、response wrapper、API 文档或 backend gap 前，读 `references/ssr-contracts-and-mock.md`。
- 改缓存、revalidation、服务端数据流、性能、bundle 或 RSC 序列化前，读 `references/ssr-cache-and-performance.md`。
- 改 request id、日志、trace、Web Vitals、客户端错误、审计事件或敏感字段脱敏前，读 `references/ssr-observability-and-logging.md`。
- 改 security headers、cookies、CSRF、CORS、输入校验、上传下载、redirect、XSS 防线或私有数据缓存前，读 `references/ssr-security-baseline.md`。
- 改环境变量、public/server config、secret 注入、feature flag、base URL、PM2 env 或配置校验前，读 `references/ssr-runtime-config.md`。
- 改 next-intl、语言切换、locale 上下文、metadata 文案、BFF locale header 或 locale cache key 前，读 `references/ssr-i18n.md`。
- 新建 SSR 项目、修改 lint/format/typecheck/commit hooks、脚本、alias import、边界扫描或质量工具链前，读 `references/quality-tooling.md`。
- 新增或修改手写 TS/TSX/JS 代码、脚本、生成器、Route Handler、Server Action、BFF gateway/service/adapter、组件或类型定义前，按项目 AGENTS 读取 TypeScript 与 comment 规则；SSR lane 不豁免通用注释和命名规则。
- 交付前，读 `references/ssr-verification.md`。

## Architecture Baseline

- SSR 项目默认采用 Next.js App Router、React Server Components、TypeScript、BFF gateway、OpenAPI/Prism mock 和分环境配置。
- 本规则只定义 SSR / BFF 架构边界，不内置 monorepo、workspace 或跨应用包治理；这些由独立 workspace 规范决定。
- SSR 项目必须保持 `src/app`、`src/bff`、`src/features`、`src/shared`、`mock` 的职责边界；目标项目已有更强目录约定时按目标项目执行。
- C 端公开内容、商品详情、分类列表、可分享页面和 SEO 关键页面优先评估 SSR；B 端运营、卖家、管理、企业内网等登录后工具默认优先评估 SPA，除非存在明确 SSR 收益。
- `src/app` 只负责路由、布局、服务端渲染入口、metadata、error/loading/not-found 和 API 边界入口。
- `src/bff` 是 SSR 应用访问后端或 Prism 的唯一服务端业务边界；所有真实出站请求必须经 gateway。
- `src/features` 负责业务 UI 和客户端交互；不直接拼后端 URL，不导入 server-only BFF gateway，不消费后端 raw DTO。
- `src/shared` 只放浏览器安全且跨业务复用的 UI、hooks、工具和常量；BFF-only helper 放 `src/bff/shared`。
- SSR 新项目仍采用 MUI-first，但 MUI 在 SSR 项目中定位为 SSR-compatible Client Component 交互体系，不作为 Server Component primitive；服务端数据、metadata、缓存和鉴权仍归 `src/app` / `src/bff`。
- 使用 MUI 的 Next.js App Router 项目必须接入与 Next 主版本匹配的 `@mui/material-nextjs/*-appRouter` cache provider，统一挂载 MUI `ThemeProvider`，并声明 Emotion/CSS 注入、防首屏样式闪烁和 Tailwind CSS layer 策略。
- `mock/openapi.yaml` 是 mock runtime 的事实来源；SSR 服务端数据也必须能经 Prism/OpenAPI 运行。
- SSR/BFF 项目必须提供统一 logger 层，推荐落点为 `packages/tools/logger` 或项目等价目录；日志层要覆盖本地/线上、client/server、request id、普通日志、接口日志、上游调用摘要、降级/异常日志和敏感字段脱敏策略。
- 生产环境客户端 console 必须自动清除或禁用；生产环境使用 PM2 启动 Next 服务时，必须声明 stdout/stderr、JSON line、实例标识、logrotate 或日志平台采集策略。
- 客户端 Web Vitals 与浏览器错误按项目需要接入，但缺口必须在 handoff 中声明。
- SSR/BFF 项目必须声明安全基线：security headers、cookie、CSRF、CORS、输入校验、redirect、上传下载、私有数据缓存和 source map 策略。
- SSR/BFF 项目必须声明运行时配置边界：server secret、server runtime、client public、build-time config、request context 和配置校验方式。
- SSR/BFF 项目默认使用 `next-intl` 管理语言上下文；新项目不使用 locale 路由，语言切换通过 next-intl 更新 locale 后刷新当前页面相关接口，并提供 loading/pending 状态。
- SSR 新项目必须继承通用 quality tooling 基线，包括 ESLint flat config、Prettier、EditorConfig、Commitlint、Husky/lint-staged、pnpm 脚本、`check` 聚合命令和触达文件 format check；已有项目按兼容优先，但缺口要在 handoff 中声明。
- SSR 新增手写代码必须继承通用 comment 规则：函数、组件、Route Handler、Server Action、BFF gateway/service/adapter、请求封装、runtime 接线、复杂分支、类型和字段都要有能说明职责、边界或业务语义的中文注释。
- SSR TypeScript 代码继续使用 `I` 前缀 interface、`T` 前缀 type alias；DTO、view model、action result、request context 和 endpoint id 类型都不能例外。
- SSR 应用代码继续遵守通用 import 边界：跨目录 import 使用配置 alias，同目录允许 `./`，不要用 `../` 或 `../../../` 把 App Router、BFF、features、shared 边界绕开。
- Draft / Preview / CMS 预览态暂不纳入当前 SSR 通用基线；需要时单独设计。

## Non-Negotiable Boundaries

- Client Component 不能是 async component，不能导入 server-only 模块，不能读取服务端环境变量。
- Server Component 传给 Client Component 的 props 必须可序列化，并且只传 UI 实际需要的字段。
- Route Handler 只允许作为 BFF HTTP 入口、webhook、健康检查、外部 REST 或受控 legacy 兜底；不得直接操作 DB/Redis/MQ/后台任务。
- Server Action 只用于 Next UI 内部 mutation；公开 HTTP 契约、第三方回调和外部系统访问必须使用 Route Handler。
- BFF service、action、route facade 和 adapter 不得直接拼后端 base URL；真实请求只由 gateway 发起。
- 后端 DTO、Java envelope、Prism example、数据库字段不得直接泄漏到页面组件或 Client Component。
- `backend-gap` 只能作为契约缺口说明；mock 默认响应不得用缺口或 501 替代业务验收数据。

## Default Data Path

```text
Server Component / Route Handler / Server Action
  -> src/bff/routes or src/bff/actions
  -> src/bff/services
  -> src/bff/adapter
  -> src/bff/gateway
  -> backend HTTP service or Prism mock
```

小型项目可以合并 `routes` 与 `services`，但必须保留 gateway 独占出站请求、adapter 独占模型映射、UI 不消费 raw DTO 这三条边界。

## Delivery Gates

- 每个 SSR 数据能力必须能追溯到 endpoint id、OpenAPI operationId、DTO、BFF adapter、mock example、API 文档和错误码。
- 每个登录态或权限态页面必须声明动态渲染、`no-store` 或等价缓存隔离策略。
- 每个公开页面必须声明 metadata 来源、canonical/OG 策略和图片/font/script 处理方式。
- 每个使用 MUI 的 SSR 项目必须声明 MUI provider 入口、`@mui/material-nextjs` 版本路径、CSS layer / Tailwind 共存策略、ThemeProvider 位置和 bundle 优化策略。
- 每个 BFF/SSR 入口必须声明 request id 传递、普通日志/接口日志 schema、脱敏策略和慢请求/上游失败排查证据。
- 每个受保护页面、Route Handler 和 Server Action 必须声明鉴权、权限、CSRF/签名、输入校验、cache header 和敏感数据暴露策略。
- 每个环境必须声明配置来源、required env、public/server 分界、secret 注入和 mock/dev/test/prod 切换方式。
- 每个多语言页面必须声明 locale 来源、next-intl 接入点、语言切换刷新范围、BFF locale 透传、loading 状态和 cache locale 隔离。
- 每个 SSR 交付必须声明通用 quality tooling 状态：lint、format、typecheck、commit hooks、alias 配置、边界扫描、包管理器和 `check` 脚本是否已接入或作为兼容缺口保留。
- 每次 SSR 代码交付前必须自检手写代码的注释质量、TS interface/type 命名、DTO 字段说明、TSX 关键结构注释和复杂分支说明；模板或生成器不可控的缺口必须在 handoff 中说明。
- 示例、模板、脚手架片段统一放 `assets/ssr/` 下，不直接塞入 reference；主入口按 SPA/SSR route 分流后再统一整理可复用资产。
- 每次交付必须运行窄验证；共享路由、BFF、契约或缓存变化必须增加边界测试或 mock smoke。
