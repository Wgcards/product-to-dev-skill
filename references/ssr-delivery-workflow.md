# SSR Delivery Workflow

## Choose SSR Or SPA

选择 SSR / Next.js App Router：

- C 端公开访问、商品/内容详情、分类列表、营销承接页、可分享页面或搜索引擎可见页面。
- 页面需要 SEO、metadata、Open Graph、sitemap、robots 或可分享内容。
- 首屏依赖服务端鉴权、服务端数据预取、缓存策略或减少客户端请求瀑布。
- 项目需要 BFF gateway、后端契约治理、OpenAPI/Prism mock、服务端缓存或受控 webhook / 外部 REST 入口。
- 业务同时包含公开内容页、登录态页面、BFF API 或 webhook，且 SSR 收益高于部署和运维复杂度。

选择 SPA：

- B 端运营、卖家、管理、企业账户、CRM、配置台等纯登录后工具，搜索引擎不可见，服务端渲染收益低。
- 既有项目稳定采用 Vite SPA，且用户没有批准迁移。
- SSR 带来的部署、缓存、鉴权和运维复杂度明显高于业务收益。

## Intake Checklist

- 新建项目还是既有项目改造。
- Next/React/TypeScript 目标版本、Next 主版本文件约定、`middleware.ts` 或 `proxy.ts` 选择，以及 async request API 写法。
- Next 执行约定：特殊文件、route group、parallel/intercepting routes、`template.tsx`、`default.tsx`、metadata files、sitemap/robots/manifest。
- 业务面向 B 端还是 C 端；页面是否公开可访问、可分享、需要 SEO 或服务端首屏数据。
- 页面类型：公开 SEO、登录态、权限态、后台操作、webhook、健康检查、外部 REST。
- i18n 策略：使用 `next-intl`，不使用 locale 路由；语言切换刷新当前页面相关接口并提供 loading/pending 状态。
- 数据源：Prism mock、真实后端、第三方 API、backend gap。
- 鉴权方式：浏览器会话、BFF authorization header、角色/权限/租户模型。
- 安全基线：security headers、cookie 属性、CSRF、CORS、输入校验、redirect allowlist、上传下载、source map、私有数据缓存。
- 配置基线：server secret、server runtime、client public、build-time config、request context、required env、secret 注入、feature flag、base URL、PM2 env。
- 缓存策略：static、ISR、dynamic、no-store、tag/path revalidation。
- 观测策略：统一 logger 落点、local/prod 行为、client/server transport、request id、普通日志、接口日志、上游调用摘要、降级/异常日志、Web Vitals、客户端错误、审计事件、敏感字段脱敏和 PM2 日志管理。
- 运行资产策略：`next/image`、`next/font`、`next/script`、`next/link`、第三方脚本、CSS import、polyfill、bundle analyzer。
- UI runtime 策略：按 `references/ssr-ui-runtime.md` 声明 MUI/Emotion 依赖集合、`@mui/material-nextjs/*-appRouter` 版本路径、`AppRouterCacheProvider`、ThemeProvider、Emotion/CSS 注入、Tailwind CSS layer 共存、暗色模式防闪烁和 MUI bundle 优化。
- 验证门禁：typecheck、lint、build、mock smoke、boundary tests、e2e、截图。

## Default Layout

```text
src/
  app/
  bff/
    gateway/
    services/
    adapter/
    routes/
    actions/
    dto/
    shared/
    transform/
  features/
  shared/
  types/
    dto/
  locale/
mock/
  openapi.yaml
  examples/
```

如果目标项目已经有自定义 app 根目录，本规则只要求保留同等职责边界，不规定项目组织形态。

## Migration Matrix

既有项目改造前先输出矩阵，至少覆盖：

| Area | Decision |
| --- | --- |
| Framework | Next/React/TypeScript 版本、App Router 状态 |
| Package manager | pnpm/npm/yarn/bun 状态 |
| Routing | app router/page router/API route/metadata/error/loading/global-error/not-found/forbidden/unauthorized/proxy/template/default/parallel/intercepting |
| UI library | 既有组件库、MUI 适配、SSR provider、CSS layer、RSC/client 边界、兼容例外 |
| Data layer | BFF/gateway/request wrapper/service/hook |
| Contract | endpoint id/OpenAPI/DTO/API docs/SQL |
| Mock | Prism/OpenAPI/example/smoke |
| Auth | session source、authorization header、permission model |
| Security | headers、cookie、CSRF、CORS、validation、redirect、upload/download、source map、private cache |
| Runtime config | env classes、required env、secret injection、NEXT_PUBLIC、feature flags、base URLs、PM2 env、validation |
| Cache | static/ISR/dynamic/no-store/revalidation |
| Observability | logger 落点、request id、普通日志、接口日志、client/server transport、trace 透传、Web Vitals、客户端错误、审计事件、脱敏、PM2 |
| Deployment | standalone/self-hosting/cache handler/healthcheck |
| Runtime assets | next/image、next/font、next/script、next/link、CSS import、MUI Emotion/cache、CSS layer、third parties、bundle analyzer |
| i18n | next-intl、无 locale 路由、locale 来源、语言切换刷新范围、metadata 文案、错误文案、cache locale key |
| Quality | typecheck/lint/build/boundary/e2e/screenshot |

状态使用 `compliant`、`migrated`、`compatible-exception`、`non-compliant`。不能把 `non-compliant` 项当作完成。

## Delivery Steps

1. 判断 SSR/SPA 路径，既有项目先做迁移矩阵。
2. 建立或适配 App Router 基线：layout、page、loading、error、not-found、metadata、provider、global style；新项目不建立 locale route segment。
3. 建立 UI runtime 基线：MUI/Emotion/`@mui/material-nextjs` 依赖集合、匹配 Next 主版本的 `@mui/material-nextjs/*-appRouter`、`AppRouterCacheProvider`、ThemeProvider、CSS layer / Tailwind 共存、暗色模式防闪烁和 MUI client leaf 组件边界；可从 `assets/ssr/examples/next-app-router-mui-provider.md` 复制最小形态。
4. 建立 BFF 基线：contracts、gateway、services、adapter、routes、actions、shared、request id、错误归一。
5. 建立配置基线：统一 config accessor、required env schema、server/client public 边界、secret 注入、mock/dev/test/prod base URL、feature flag 和 PM2 env。
6. 建立安全基线：security headers、cookie/session、CSRF、CORS、输入校验、redirect allowlist、上传下载、source map、私有数据缓存。
7. 建立观测基线：统一 logger/context helper、local/prod 和 client/server transport、request id 生成/透传、普通日志/接口日志 schema、上游调用摘要、降级/异常日志、敏感字段脱敏、生产 client console 清除和 Web Vitals/客户端错误策略。
8. 建立 i18n 基线：`next-intl` provider/messages、locale 来源、BFF locale header、metadata/error 文案、语言切换刷新范围和 loading/pending 状态。
9. 建立错误和状态页基线：error、global-error、not-found、unauthorized、forbidden、redirect/notFound 处理策略。
10. 建立 mock 基线：OpenAPI path、operationId、schemas、examples、Prism 启动脚本和 smoke。
11. 按业务模块实现页面：Server Component 负责首屏和服务端数据，MUI-heavy Client Component 负责交互。
12. 配置缓存和部署策略：公开数据用 static/ISR/tag；用户态数据用 no-store/dynamic；mutation 精确 revalidate；自托管声明 standalone 和 cache handler；locale 影响内容时隔离 cache key/tag。
13. 配置运行资产策略：`next/image` remotePatterns/sizes/priority、`next/font` 初始化位置、`next/script` strategy/id、`next/link` 站内导航、CSS import、MUI Emotion/cache、CSS layer、bundle analyzer。
14. 加边界门禁：RSC、MUI provider、Route Handler、BFF 出站、adapter、mock runtime、backend gap、CSR bailout、Server Component 自调 `/api`、日志脱敏、security header、CSRF、runtime config、无 locale route、语言切换 loading、parallel route default、production console。
15. 验证并交付：typecheck、lint、build、mock smoke、边界测试；需要 UI 证据时补 e2e 或截图；Next 16+ 可用 MCP 或 `--debug-build-paths` 辅助定位。

## Handoff Matrix

| Area | Required Evidence |
| --- | --- |
| Framework | Next/React/TypeScript 版本、App Router、runtime |
| Rendering | static/ISR/dynamic/no-store 策略 |
| BFF | gateway、service、adapter、route/action facade |
| Contract | endpoint id、OpenAPI path、operationId、DTO、错误码 |
| Mock | Prism 启动命令、关键 endpoint smoke |
| Auth | session source、authorization header 映射 |
| Security | header 来源、cookie/CSRF/CORS/validation/redirect/upload/source map/private cache 策略 |
| Runtime config | env key 清单、敏感级别、server/client 分界、注入方式、校验方式、PM2 env |
| UI library | MUI/Emotion 依赖、provider 入口、`@mui/material-nextjs` 版本路径、ThemeProvider、CSS layer、client leaf 边界和兼容例外 |
| Cache | revalidate/tag/path/no-store 和失效点 |
| Observability | logger 落点、request id、普通日志/接口日志、上游摘要、降级/异常日志、脱敏、生产 client console、PM2、Web Vitals/客户端错误 |
| Deployment | standalone、runtime、cache handler、多实例缓存一致性和 healthcheck |
| Runtime assets | image/font/script/link/CSS/MUI Emotion/cache/CSS layer/polyfill/bundle 处理证据 |
| I18n | next-intl、locale 来源、无 locale route、语言切换刷新范围、loading 状态、BFF header、cache key |
| Boundary | 静态扫描或单测覆盖的禁止依赖 |
| UX | loading/error/empty/not-found/redirect/unauthorized |
| Verification | typecheck、lint、build、mock smoke、e2e 或截图 |
