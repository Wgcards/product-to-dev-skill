# SSR Runtime Config

## Goals

- SSR / BFF 项目必须明确 build-time config、server runtime config、client public config、mock/dev/test/prod 环境和 secret 注入方式。
- 配置规范只定义应用读取和校验边界，不定义 pnpm workspace、包发布或跨应用治理。
- 任何配置都必须可追踪来源、可校验类型、可区分敏感级别，并能在 handoff 中说明如何本地启动、如何生产注入、如何排查配置缺失。

## Config Classes

- `server secret`：后端 token、签名密钥、数据库/Redis/MQ URL、OAuth client secret、供应商 secret；只能在服务端读取，不能带 `NEXT_PUBLIC_`。
- `server runtime`：后端 base URL、Prism URL、日志级别、PM2 实例信息、cache handler URL、feature flag server key；只能在 BFF/server 读取。
- `client public`：公开站点 URL、公开 analytics id、非敏感 feature flag、CDN public base；必须带 `NEXT_PUBLIC_` 或由服务端安全地注入 public config。
- `build-time`：Next 编译期需要的配置，例如 `output`、image remotePatterns、bundle analyzer、public env；变更后必须重新构建。
- `request context`：locale、currency、tenant、session、request id、traceparent；来自请求，不是全局 env。

## Environment Files

- 本地可以使用 `.env.local`、`.env.development.local` 或项目约定文件；这些文件不得提交。
- 仓库可以提交 `.env.example` 或 `.env.template`，只放 key、说明、示例占位符和默认非敏感值。
- 不提交 `.env.production`、真实 token、真实 cookie、真实后端凭证或供应商密钥。
- mock/dev/test/prod 的配置差异必须通过 env、部署平台或受控配置文件表达，不在组件、service 或 gateway 中写死域名判断。

## Validation And Loading

- SSR 项目应提供统一配置读取层，推荐落点为 `src/shared/config`、`src/bff/shared/config` 或项目等价目录；共享包场景可沉淀到 `packages/tools/config`。
- 服务端配置启动时必须做 runtime validation，推荐 Zod、Valibot、envalid、envsafe 或项目既有 schema 工具。
- 配置校验失败应 fail fast：本地输出缺失 key 和说明，生产启动失败或健康检查失败；不得在请求中途才发现关键 secret 缺失。
- 客户端 public config 必须有单独 schema；server secret 不得经过 props、JSON route、window 全局变量或 hydration payload 下发。
- 配置读取禁止散落 `process.env.X`；业务代码通过 config accessor 获取稳定字段，便于测试和审计。

## Next Public Env Rules

- `NEXT_PUBLIC_*` 会进入客户端 bundle 或 HTML；任何带 secret、token、password、private、cookie、database、redis、mq、signing 等含义的字段不得使用该前缀。
- build-time public env 修改后必须重新构建；运行时改 PM2 env 不会改变已编译进客户端 bundle 的值。
- 如果需要运行时 public config，使用受控 Route Handler 输出白名单 public config，并配 cache/header；不要把完整 env dump 给浏览器。
- Client Component 不能读取非 `NEXT_PUBLIC_*` env；共享模块若被 client import，也不能引用 server env。

## Service Endpoints

- BFF gateway 从配置层获取 backend / Prism base URL；页面、Client Component、feature service 不拼 base URL。
- 每个环境至少声明：
  - `APP_ENV`
  - `APP_ORIGIN`
  - `BACKEND_API_BASE_URL`
  - `PRISM_MOCK_BASE_URL` 或 mock endpoint
  - `LOG_LEVEL`
  - `SESSION_COOKIE_NAME`
  - `SESSION_COOKIE_SECURE`
  - `CSRF_ENABLED`
  - cache / observability / feature flag 相关 key
- base URL 必须限制协议和 host；生产不允许意外指向 localhost、mock、内网调试域名或未加 TLS 的公网 HTTP。
- 第三方 API URL、OAuth redirect URI、webhook callback URL 必须在配置和 API 文档中一致。

## Feature Flags

- feature flag 分为 server-only flag 和 client-public flag；默认 server-only。
- flag 默认值、环境覆盖、失效时间和业务 owner 必须可追踪；不要把长期业务分支隐藏在未记录 flag 后。
- 权限、安全、价格、库存、支付、订单等关键逻辑不能只靠客户端 public flag 控制。
- 客户端 flag 只控制展示和交互，不作为鉴权或数据访问边界。

## PM2 And Process Runtime

- PM2 启动 Next 时通过 `ecosystem.config.*`、平台变量或 secret manager 注入生产 env；不得依赖开发机 shell 隐式变量。
- PM2 配置必须声明 `NODE_ENV=production`、`APP_ENV`、`PORT`、`HOSTNAME`、日志级别、实例数和必要 secret 来源。
- cluster 多实例环境下，所有实例必须读取同一套配置来源；临时修改 env 后必须 reload/restart 并记录版本。
- 配置变更与发布版本、commit、build id 关联；线上排查时能知道当前实例实际读取的 env 摘要。

## Config And Cache Interaction

- cache key、tag、revalidation、image remotePatterns、CSP allowlist、CORS allowlist、cookie domain 这些配置变更可能改变运行行为，必须进入 handoff。
- ISR/tag cache 多实例依赖 shared cache handler 时，cache handler URL 和命名空间必须来自 server runtime config。
- 配置不能作为隐式全局状态在请求中被修改；request context 用参数传递，不写回 env/config singleton。

## Safe Exposure And Diagnostics

- 可以提供受控诊断入口显示非敏感配置摘要，例如 app version、env、region、build id、enabled feature flags、backend host hash、cache mode。
- 诊断入口不得显示 secret value、完整 env、cookie、authorization header、数据库 URL 或供应商凭证。
- 健康检查分轻量和深度：轻量只检查进程存活和版本；深度依赖检查必须鉴权或仅内网可访问。

## Verification

- CI 或启动检查应验证 required env、类型、枚举、URL 协议、生产禁用 mock URL、server secret 未使用 `NEXT_PUBLIC_`。
- 边界扫描应覆盖：Client Component 不读取 server env；共享 client-safe 模块不 import server config；gateway base URL 只来自 config accessor。
- 生产 handoff 必须包含：env key 清单、敏感级别、默认值、注入方式、是否 build-time、是否需要重建、PM2 env 来源、配置校验命令或启动失败策略。
