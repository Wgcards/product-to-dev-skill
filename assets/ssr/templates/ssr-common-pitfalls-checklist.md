# SSR Common Pitfalls Checklist

本清单用于 SSR/BFF 项目实现前自检、代码评审和交付前验收。更细的规则以 `references/ssr-*.md` 为准。

## Route And Runtime

- 新建 SSR 项目继承通用 quality tooling：ESLint flat config、Prettier、EditorConfig、Commitlint、Husky/lint-staged、pnpm 脚本和 `check` 聚合命令。
- 已有 SSR 项目优先兼容既有工具链，但 lint、format、typecheck、alias import、边界扫描或 commit hooks 缺口要写入 handoff。
- 手写 TS/TSX/JS 代码按项目 comment 规则补中文注释；函数、组件、Route Handler、Server Action、BFF gateway/service/adapter、请求封装、类型字段和复杂分支都不能漏。
- TypeScript interface 使用 `I` 前缀，type alias 使用 `T` 前缀；DTO、view model、action state、request context 和 endpoint id 类型都要自检。
- 跨目录 import 使用项目 alias，同目录允许 `./`；不要用 `../` 或 `../../../` 绕过 `src/app`、`src/bff`、`src/features`、`src/shared` 边界。
- `page.tsx` 和 `route.ts` 没有放在同一路由目录。
- Next 主版本已声明；Next 15+ 的 `params`、`searchParams`、`cookies()`、`headers()` 按 async API 使用。
- Next 16+ 默认使用 `proxy.ts`；仍需 Edge runtime 时记录 `middleware.ts` 兼容例外。
- Route Handler 只做 HTTP 边界入口，不承接 DB、Redis、MQ、邮件、支付轮询、后台任务或供应商同步。
- Server Component 内部读业务数据不通过 `fetch('/api/...')` 自调同站 Route Handler。

## RSC And Client Boundary

- Client Component 不声明 `async function`，不直接 `await` 服务端数据。
- Client Component 不导入 `src/bff/**`、server-only helper、Node API、后端 SDK 或 server env。
- Server Component 传给 Client Component 的 props 可序列化，只包含 UI 实际需要字段。
- `Date` 转 ISO 字符串，`Map/Set` 转数组或对象，class instance 转 plain object。
- 使用 `useSearchParams()` 或动态路由中的 `usePathname()` 时，最近层级有 `Suspense` 或明确 Next 版本例外。

## BFF And Contract

- 真实出站请求只在 `src/bff/gateway` 发起。
- service 不拼 base URL，不读取浏览器状态，不返回后端 raw DTO。
- adapter 不发请求、不读 cookies/headers/env、不触发 revalidation。
- 每个能力都能追到 endpoint id、OpenAPI operationId、DTO、adapter、mock example 和 API 文档。
- 运行时 mock 走 Prism/OpenAPI，不在 service、hook、page 或 action 中写死成功响应。
- 后端缺口只写入 `backend-gap` 和 handoff，不作为默认成功或默认 501 运行时路径。

## Cache And Revalidation

- 登录态、权限态、租户态、用户态数据默认 `no-store` 或等价隔离。
- 公开缓存包含 revalidate 时间、cache tag、path revalidation 或不缓存原因。
- cache key/tag 包含 locale、tenant、currency、permission 等必要维度。
- mutation 成功后明确 `revalidatePath`、`revalidateTag`、客户端刷新或无需刷新的原因。
- metadata 和页面共用数据时，通过 BFF read 能力或请求级缓存去重。

## Security

- BFF 把 httpOnly session 转换为后端 `authorization` header，token 不进入 props 或 JSON response。
- Route Handler 和 Server Action 都做鉴权、权限、资源归属和运行时输入校验。
- cookie mutation 集中管理，并声明 HttpOnly、SameSite、Secure、path/domain/maxAge。
- cookie 会话 mutation 有 CSRF、origin/referer 或项目等价防线。
- webhook 有签名、时间戳、重放窗口或来源校验。
- redirect/OAuth callback/支付回跳/邀请链接使用同源相对路径或 allowlist。
- CORS 默认关闭或使用明确 allowlist；带凭证接口不使用 `*`。

## UI Runtime

- MUI SSR 项目使用匹配 Next 主版本的 `@mui/material-nextjs/*-appRouter` cache provider。
- MUI-heavy UI 下沉到叶子 Client Component，公开 SEO 内容、metadata 和服务端数据不被整页 client subtree 接管。
- `next/image` 远程图配置 `remotePatterns`；`fill` 图片包含 `sizes`；LCP 图片策略已声明。
- `next/font` 只在 layout 或共享字体模块初始化。
- 第三方脚本使用 `next/script` 或项目脚本封装；内联脚本有稳定 `id`。

## Observability And Delivery

- 每个 BFF/Route Handler/Server Action 都能拿到 request id。
- gateway 记录 endpoint id、method、path、duration、status、业务 code 和 request id。
- 错误日志脱敏 token、cookie、密码、完整邮箱/手机号、后端堆栈和供应商敏感响应。
- 生产客户端没有裸 `console.log` / `console.debug`。
- 已运行窄 `typecheck`、`lint`/边界扫描、`next build`、OpenAPI/Prism contract check 或 mock smoke。
- 涉及 UI、metadata、图片、首屏、响应式或 hydration 风险时，已做浏览器或截图检查。
