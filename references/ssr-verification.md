# SSR Verification

## Minimum Checks

- 运行项目可用的最窄 `typecheck`。
- 运行项目可用的最窄 `lint` 或边界静态扫描。
- 运行项目可用的最窄 `format:check` 或对触达文件执行 Prettier/格式检查；新项目应由 `check` 聚合 lint、typecheck 和 format check。
- 运行生产构建，例如 `next build` 或项目等价命令。
- 运行 OpenAPI/Prism contract check 或 mock smoke。
- 对触达文件运行格式检查或项目格式命令。
- SSR 新项目需确认 `references/quality-tooling.md` 的 ESLint flat config、Prettier、EditorConfig、Commitlint、Husky/lint-staged、pnpm 脚本和 `check` 命令已接入；已有项目未接入时需记录兼容缺口。
- SSR 代码交付需确认项目 AGENTS 指定的 TypeScript interface/type 命名和 comment 规则已自检；函数、组件、Route Handler、Server Action、BFF gateway/service/adapter、请求封装、类型字段和复杂分支不能漏注释。
- SSR 项目需确认 Next 主版本、`middleware.ts` / `proxy.ts` 约定、runtime 和部署模式已在 handoff 中声明。
- SSR 项目需确认统一 logger 落点、request id、普通日志/接口日志 schema、脱敏、生产 client console 清除、PM2 日志策略、客户端错误/Web Vitals 或对应缺口已在 handoff 中声明。
- SSR 项目需确认 security headers、cookie、CSRF、CORS、runtime validation、redirect allowlist、source map 和私有数据 cache 策略已在 handoff 中声明。
- SSR 项目需确认 required env、server/client config 分界、secret 注入、`NEXT_PUBLIC_*` 审计、base URL、feature flag、PM2 env 和配置校验方式已在 handoff 中声明。
- SSR 项目需确认 next-intl、无 locale route、语言切换刷新范围、loading/pending 状态、BFF locale header 和 locale cache key 已在 handoff 中声明。
- 使用 MUI 的 SSR 项目需确认 `AppRouterCacheProvider`、ThemeProvider、CSS layer / Tailwind 共存、暗色模式防闪烁、MUI client leaf 边界和 bundle 优化策略已在 handoff 中声明。
- 开发调试时先确认真实 dev server 端口；Next 16+ 可使用 `/_next/mcp` 获取 routes/errors/logs，Next 16+ 构建问题可用 `next build --debug-build-paths` 缩小验证范围。

## Boundary Tests

SSR 项目应至少覆盖这些边界：

- Client Component 不声明 async component。
- TypeScript interface 使用 `I` 前缀；type alias 使用语义化 PascalCase，不强制 `T` 前缀；DTO、view model、action state、request context、endpoint id、枚举或状态联合类型命名符合通用规则，例如 `OrderStatus`。
- 手写函数、组件、Route Handler、Server Action、BFF gateway/service/adapter、runtime wrapper、复杂分支和类型字段有中文注释，说明职责、边界、输入输出或业务语义。
- 跨目录 import 使用项目 alias，同目录才使用 `./`；应用代码不通过 `../` 或 `../../../` 绕过 `src/app`、`src/bff`、`src/features`、`src/shared` 边界。
- `src/shared/**` 不依赖 `src/app/**`、`src/bff/**` 或业务 feature；BFF-only helper 放在 `src/bff/shared/**`。
- Client Component 不导入 server-only BFF、Node API、服务端环境或后端 SDK。
- `useSearchParams()` 和动态路由中的 `usePathname()` 被最近的 `Suspense` 包裹，或有明确的 Next 版本/`generateStaticParams` 例外说明。
- Server Component 传给 Client Component 的 props 可序列化且字段最小化。
- Server Component 不通过 `fetch('/api/...')` 自调同站 Route Handler 获取内部数据。
- Route Handler 不导入 DB/Redis/MQ/旧 server lib，不直接导入 BFF service 绕过 route facade。
- BFF service/action/route facade 的真实出站请求只经 gateway。
- Route Handler、Server Action、webhook、query、params、body、formData 有 runtime validation；TypeScript 类型不作为安全边界。
- cookie mutation 集中在 BFF route/action facade 或 shared helper，并设置 HttpOnly、SameSite、Secure 条件、path/domain/maxAge。
- cookie 会话 mutation 有 CSRF 或 origin/referer 校验；webhook 有签名、时间戳、重放窗口或等价来源校验。
- CORS 默认关闭或使用明确 allowlist；带凭证接口不使用 `Access-Control-Allow-Origin: *`。
- redirect、OAuth callback、支付回跳、邀请链接只允许同源相对路径或 allowlist URL。
- server secret 不使用 `NEXT_PUBLIC_*`，Client Component 和 client-safe shared 模块不读取 server env。
- gateway base URL、Prism URL、backend URL 只来自 config accessor，生产不指向 localhost/mock/debug 域名。
- Server Action 或 Route Handler catch 块不吞掉 `redirect()`、`notFound()`、`unauthorized()`、`forbidden()` 等 Next 导航异常。
- adapter 不发请求、不读 cookies/headers、不触发 revalidation。
- mock runtime 不返回 hardcoded service fallback，而是通过 Prism/OpenAPI。
- backend gap 不成为默认成功或默认 501 运行时响应。
- `error.tsx` / `global-error.tsx` 是 Client Component；`global-error.tsx` 包含 `<html>` 和 `<body>`；登录态项目有 `unauthorized.tsx` / `forbidden.tsx` 或等价路由策略。
- parallel route 的每个 `@slot` 有 `default.tsx`；intercepting route modal 关闭用 `router.back()`；route matcher 层级有明确说明。
- 新项目不存在 `app/[locale]/**` 或按语言复制的路由树；既有 locale route 只作为兼容例外记录。
- 站内跳转使用 `next/link` 或受控 `useRouter()`，不是普通 `<a href>`。
- `next/image` 的 `fill` 用法包含 `sizes`，LCP 图片策略明确，远程图片配置 `remotePatterns`。
- `next/font` 只在 layout 或共享字体模块初始化；没有在普通组件中重复创建字体实例；没有用 CSS `@import` 或手写 Google Fonts `<link>`。
- 第三方脚本使用 `next/script` 或 `@next/third-parties`；内联 `Script` 有 `id`；`beforeInteractive` 只在根 layout 且有必要性说明。
- 本地 CSS 通过 import/CSS Modules/样式系统进入构建；没有手写 CSS `<link>` 或冗余 polyfill CDN。
- MUI 项目使用匹配 Next 主版本的 `@mui/material-nextjs/*-appRouter`，根 provider 包含 `AppRouterCacheProvider`，ThemeProvider 不在普通组件重复挂载。
- MUI-heavy UI 位于叶子 Client Component；公开 SEO 内容、metadata、缓存判断和服务端数据读取没有被整页 MUI client subtree 接管。
- MUI 与 Tailwind v4 共存时有 CSS layer 配置；没有用重复 `!important`、组件内临时 `<style>` 或 import 顺序偶然性解决优先级。
- 暗色模式、系统主题、MUI media query 和 responsive 初始值没有造成 hydration mismatch 或首屏主题闪烁。
- 大型 UI/icon 包使用 `optimizePackageImports`、直接导入或有 bundle 风险说明；性能敏感路径无未约束的 barrel import。
- server-incompatible、native、ESM/CJS 问题依赖已通过 Client wrapper、`dynamic(..., { ssr: false })`、`serverExternalPackages` 或 `transpilePackages` 处理。
- 业务代码不直接输出 token/cookie/password/完整敏感 payload，Client Component 不导入服务端 logger 或 BFF-only logging helper。
- 生产 Client Component 不保留裸 `console.log` / `console.debug`；受控保留的 warn/error 必须有说明。

## Contract Tests

- 每个 implemented endpoint 有 OpenAPI path、operationId、schema、example 和 DTO。
- 每个 frontend/BFF method 能映射到 endpoint id。
- response wrapper 缺失、业务 code 失败、HTTP non-2xx、malformed JSON 和 timeout 都有稳定错误。
- 鉴权失败、权限不足、校验失败、业务失败至少各有一个 example 或测试覆盖。
- API 文档中 implemented/planned/backend-gap/mock-unavailable 状态与 OpenAPI 和前端调用一致。

## Runtime Smoke

- 公开 SSR 页面能返回非空 HTML，并包含关键业务内容或 skeleton。
- 登录态 SSR 页面在无会话时返回登录/401/redirect 的预期状态，不泄漏用户数据。
- 受保护页面和接口在权限不足时返回 403/forbidden；资源 id 访问校验资源归属。
- 私有数据响应包含 no-store 或等价 cache header；公开缓存不会命中用户态、租户态或权限态数据。
- 语言切换后 URL path 不变化；当前页面相关 BFF/客户端 GET 按新 locale 刷新；切换期间有 pending/loading 防重复交互。
- CSRF 缺失、非法 origin、非法 redirect、输入校验失败、非法 CORS preflight 都有稳定错误。
- 配置校验失败能 fail fast；本地缺失 required env 有明确错误，生产不会静默 fallback 到 mock。
- 关键 Route Handler 在 mock 模式下返回稳定 wrapper、status、headers 和 request id。
- mutation 成功后触发正确 revalidation 或客户端刷新。
- webhook/外部入口验证签名或来源，缺失时拒绝。
- BFF 日志包含 request id、入口、上游调用摘要和异常信息；可降级/可缺省上游失败不会拖垮主流程。
- 至少一个成功请求、一个上游失败和一个可降级失败能在日志中用 request id 串联入口、gateway、异常或降级事件。
- 接口日志包含时间、request id、用户 id、cookie 摘要、接口地址、入参摘要、出参摘要、状态和耗时，且生产环境敏感字段已脱敏。
- PM2 生产部署项目能说明 stdout/stderr、out/error 文件、实例标识、日志轮转和日志平台采集方式。
- 自托管或多实例部署时，ISR/tag cache 的共享 cache handler、禁用策略或一致性风险已验证。

## Browser And Screenshot Checks

- 涉及 UI、响应式、metadata、图片、首屏、复杂交互或 hydration 风险时，使用 Playwright/e2e 或截图验证。
- 检查 desktop 和 mobile 两类视口。
- 检查 console error、network failure、hydration warning、layout shift 和加载/空态/错误态。
- 对内容详情页检查 title、description、canonical、OG tags 和主要图片渲染。
- 对公开大型站点检查 sitemap/robots/manifest、hreflang 或 alternates、动态 OG、`generateSitemaps()` / `generateImageMetadata()` 是否符合页面规模。
- 检查 metadata、错误页、空态、mock 文案、BFF locale header 和 cache tag/key 使用当前 locale。
- 检查 Suspense fallback 不造成明显 layout shift，Client Component hydration 后不重复请求首屏关键数据。
- 使用 MUI 时检查首屏是否出现无样式闪烁、Emotion style 顺序错误、Tailwind layer 覆盖异常、暗色模式闪烁和 MUI icon/chunk 体积异常。
- 浏览器检查 security headers、CSP 报错、mixed content、source map 暴露、第三方脚本加载和跨站 cookie 行为。

## Handoff Requirements

交付说明必须包含：

- 变更的路由、BFF、契约、mock、缓存和验证范围。
- 每类页面的 rendering/cache 策略：static、ISR、dynamic、no-store、tag/path revalidation。
- Next 主版本、`middleware.ts`/`proxy.ts`、Node/Edge runtime、standalone/self-hosting 和多实例缓存策略。
- Next 特殊文件使用情况：`template.tsx`、parallel `default.tsx`、route group、intercepting route、metadata files、sitemap/robots/manifest。
- next/image、next/font、next/script、next/link、bundle analyzer、serverExternalPackages/transpilePackages 的采用或不适用原因。
- MUI SSR 说明：`@mui/material-nextjs` 版本路径、`AppRouterCacheProvider`、ThemeProvider、Emotion/CSS 注入、CSS layer / Tailwind 共存、暗色模式防闪烁、client leaf 边界和兼容例外。
- security headers 来源、cookie/CSRF/CORS/input validation/redirect/upload/source map/private cache 策略和例外。
- runtime config key 清单、敏感级别、server/client public 分界、required env、secret 注入、base URL、feature flag、PM2 env 和校验方式。
- i18n 策略：next-intl 接入点、locale 来源、无 locale route、语言切换刷新范围、loading 状态、BFF locale 透传、cache locale 隔离、多语言 SEO 风险。
- logger 落点、local/prod 与 client/server 行为、request id 生成/透传、普通日志/接口日志 schema、上游调用摘要、降级/异常日志、敏感字段脱敏、生产 client console 清除、PM2 日志策略、Web Vitals/客户端错误接入状态。
- quality tooling 状态：ESLint、Prettier、EditorConfig、Commitlint、Husky/lint-staged、pnpm/package manager、`check` 脚本、alias 配置和边界扫描已接入或兼容缺口。
- comment 与 TypeScript 命名自检结果：手写 TS/TSX/JS 注释、DTO 字段说明、TSX 关键结构注释、复杂分支注释、`I` interface 和语义化 PascalCase type alias 是否满足项目规则。
- 已接入 Prism 的 endpoint 和仍存在的 backend gap。
- 已运行命令及结果；未能运行的命令要说明具体原因。
- 残余风险，例如未覆盖的浏览器检查、后端未实现、mock 与真实服务差异、项目级 lint 噪音。
