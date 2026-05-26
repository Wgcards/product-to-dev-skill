# SSR Security Baseline

## Goals

- SSR / BFF 项目默认面向公开网络设计；任何 Route Handler、Server Action、proxy/middleware、Server Component request API 都应被视为可被攻击者间接触达。
- 安全基线只定义 Next.js SSR/BFF 前端侧职责：浏览器边界、BFF HTTP 边界、headers、cookies、CSRF、CORS、输入校验、跳转、上传下载、第三方脚本和缓存泄漏防线。
- 不通过关闭安全保护来“修复”功能问题；需要例外时必须记录原因、影响范围、补偿措施和过期条件。

## Production Baseline

- 生产环境必须运行 production build：`next build` + `next start`、`.next/standalone/server.js`、平台等价命令或 PM2 指向 production server；不得暴露 `next dev`。
- 生产环境必须设置 `NODE_ENV=production`，并在 handoff 中说明启动命令和环境来源。
- 公网自托管 Next 服务前应有 nginx、CDN、负载均衡、WAF 或等价 edge/reverse proxy，负责 TLS、请求体大小限制、慢请求防护、基础限流和静态资源缓存。
- SSR 生产部署必须声明 source map 策略：不上公网、仅上传到错误平台、或受控内网访问；不得把包含源码的 sourcemap 直接公开给匿名用户。

## Security Headers

- 项目必须声明安全 header 来源：Next `headers()`、proxy/middleware、nginx/CDN 或平台配置；不能假设平台自动处理。
- 基线 headers 至少评估：
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `X-Frame-Options` 或 CSP `frame-ancestors`
  - `Strict-Transport-Security`，仅在确认全站 HTTPS 和子域策略后启用
- CSP 优先从最小可运行策略开始，逐步收紧；不得为了省事长期使用无约束 `unsafe-inline` / `unsafe-eval`。
- 若使用 nonce/hash CSP，nonce 生成、注入和 `next/script` 使用方式必须统一；不要在多个入口各自生成不兼容 nonce。
- 第三方脚本、analytics、tag manager、chat widget 必须列入 CSP 允许清单，并说明加载策略、采样和用户同意策略。

## Cookies And Session

- 浏览器到 BFF 可使用 httpOnly same-origin cookie；BFF 到后端必须转换为 `authorization` 或项目等价服务端 header。
- 会话 cookie 默认使用 `HttpOnly`、`SameSite=Lax` 或更严格策略；跨站登录、支付回跳或第三方嵌入需要 `SameSite=None` 时必须说明原因并配合 `Secure`。
- `Secure` cookie 只在 HTTPS 生产环境或明确 TLS 环境启用；本地 HTTP 开发不得因为 Secure cookie 直接破坏登录。
- cookie path、domain、maxAge/expires 必须按业务范围最小化；登出、刷新 token、清 cookie 只在 BFF route/action facade 或 BFF shared helper 中实现。
- token、session id、权限全集、refresh token 不进入 Client Component props、JSON response、localStorage、sessionStorage、日志或 URL。

## CSRF And State Changes

- 使用 cookie 会话的 mutation 必须有 CSRF 防护：SameSite、origin/referer 校验、CSRF token、double submit cookie 或项目等价策略。
- Server Action 也按 state-changing endpoint 处理；必须鉴权、校验输入、校验来源，并避免被未授权页面或跨站请求触发敏感动作。
- Route Handler 的 `POST`、`PUT`、`PATCH`、`DELETE`、登录、登出、上传、导出、批量操作、支付/订单动作必须记录 CSRF 策略。
- webhook 和第三方回调不用浏览器 CSRF，但必须做签名、时间戳、重放窗口、来源或密钥校验。

## CORS And External Access

- 默认不开放 CORS；同站 UI 调用优先使用 same-origin BFF。
- 需要开放给外部系统、移动端或第三方的 Route Handler 必须有明确 allowlist origin、method、header、credential 策略和 OpenAPI 契约。
- 禁止在带凭证接口上使用 `Access-Control-Allow-Origin: *`。
- preflight、OPTIONS 和错误响应也必须返回稳定 CORS/header 策略，避免只有成功路径可用。

## Input Validation

- TypeScript 类型不是运行时校验；所有 Route Handler、Server Action、webhook、query、params、headers、cookies、body、formData 都必须做运行时校验。
- 推荐使用 Zod、Valibot、Yup、项目既有 schema 工具或 OpenAPI validator；校验逻辑应靠近 BFF route/action facade。
- 校验错误返回统一 wrapper、业务错误码、request id 和 locale-aware message key；不要返回 validator 原始堆栈或内部字段路径给外部用户。
- 参数进入 gateway 前必须完成白名单化和类型归一；service 不应再处理未验证 raw input。

## XSS And HTML Rendering

- 默认通过 React JSX 渲染文本；不要把 API/CMS/URL/storage/postMessage 数据拼成 HTML 注入。
- `dangerouslySetInnerHTML`、`innerHTML`、`insertAdjacentHTML`、`document.write` 属于高风险 sink；需要 rich text 时必须集中使用可信 sanitizer，并记录允许标签/属性策略。
- URL、href、redirect、iframe src、image src 等属性必须做协议和域名 allowlist，禁止 `javascript:`、不受控 data URL 和开放跳转。
- 第三方脚本使用 `next/script` 或项目封装；需要 SRI 的 CDN 脚本必须声明 integrity/crossorigin 或改为自托管。
- 用户生成内容、CMS 内容、markdown、富文本和第三方返回文本进入 metadata/OG/JSON-LD 前也要做长度、字符和结构限制。

## Redirects And Navigation

- 登录后跳转、支付回跳、邀请链接、OAuth callback、`next` / `redirect` query 必须使用 allowlist 或同源相对路径校验。
- 禁止直接把用户输入传给 `redirect()`、`NextResponse.redirect()`、`router.push()`、`window.location`。
- 外链打开使用 `rel="noopener noreferrer"`；业务需要 referrer 时必须说明风险和替代策略。

## Uploads And Downloads

- 上传入口必须限制 content type、扩展名、大小、数量和超时；大文件上传优先走后端或对象存储直传签名，不把 Next Route Handler 当长期大文件通道。
- 文件名、路径、对象 key 不可信；禁止用用户输入直接拼本地文件路径或对象存储路径。
- 下载接口必须校验权限、文件归属和 content disposition；不要把用户上传 HTML 当同源可执行页面返回。
- 图片代理、远程抓取、导入 URL 等能力必须防 SSRF：限制协议、host、私网网段、重定向和响应大小。

## Cache And Data Leakage

- 登录态、权限态、租户态、账户、订单、支付、导出、后台操作页面默认 `no-store` 或动态渲染；不得被 static/ISR 缓存。
- cache key 和 tag 必须包含租户、语言、币种、权限或用户态维度；不能让用户 A 的数据被用户 B 命中。
- Route Handler 返回用户态数据时必须设置明确 cache header；代理层/CDN 不应缓存私有响应。
- `use cache`、ISR、tag cache、React cache 只缓存公开或按 key 明确隔离的数据。

## Authorization Boundaries

- 鉴权和权限判断发生在 BFF route/action facade 或 BFF service，不能只依赖前端隐藏按钮、菜单或路由不可见。
- 每个受保护页面、Route Handler、Server Action 必须声明角色、权限、租户或资源归属校验点。
- 资源 id 不可从 URL 直接信任；读取和 mutation 必须校验资源归属。
- 权限不足返回稳定 403 或 `forbidden()`；未登录返回 401、`unauthorized()` 或项目统一登录跳转。

## Verification

- 边界测试或静态扫描应覆盖：Client Component 不导入 server-only secret 模块；Route Handler/Server Action 有 runtime validation；cookie mutation 设置安全属性；敏感接口有 CSRF 或签名校验。
- Runtime smoke 至少验证：未登录访问受保护页面、权限不足、CSRF 缺失、非法 origin、非法 redirect、输入校验失败、私有响应不被缓存。
- 交付说明必须列出：security headers 来源、cookie/CSRF 策略、CORS 策略、输入校验工具、敏感页面 cache 策略、source map 策略、仍未覆盖的安全例外。
