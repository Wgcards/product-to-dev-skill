# SSR Routing And RSC

## App Router Ownership

- `src/app` 只拥有路由段、layout、page、loading、error、global-error、not-found、forbidden、unauthorized、metadata、Route Handler、Server Action 入口和 provider 装配。
- `template.tsx` 只在需要每次导航都重新挂载 segment UI、重置 client state 或重新触发 enter effect 时使用；默认使用 `layout.tsx`。
- parallel route 的每个 `@slot` 必须提供 `default.tsx`，通常返回 `null` 或稳定 fallback，避免刷新或硬导航时 404。
- private folder 使用 `_folder` 表示不参与路由；只放 route segment 内部私有 UI/helper，不替代 `src/features` 或 `src/shared` 的业务边界。
- 业务 UI 放 `src/features/<module>`；跨业务前端安全能力放 `src/shared`；服务端 BFF 能力放 `src/bff`。
- 不在同一路由目录同时放 `page.tsx` 和 `route.ts`。需要页面和 API 同名能力时，页面留业务路径，API 放 `/api/**`。
- 路由组、parallel routes、intercepting routes 只在真实产品交互需要时使用；默认不为了目录美观引入复杂路由机制。
- 新项目不使用 locale route segment 或按语言复制路由树；语言切换按 `references/ssr-i18n.md` 通过 `next-intl` 和当前页面接口刷新处理。
- intercepting route 用于列表详情弹窗、预览和保留背景页等真实交互；关闭 modal 默认用 `router.back()`，不用 `router.push()` 或普通 `<Link>` 伪关闭。
- route matcher 按 URL segment 匹配，不按文件系统父目录匹配；使用 `(.)`、`(..)`、`(..)(..)`、`(...)` 前必须说明目标 URL 层级。
- 每个 SSR 项目必须在 handoff 或项目规则中声明 Next.js 主版本；同一项目内不得混用不同主版本的文件约定。
- Next 14/15 使用根级 `middleware.ts` 处理轻量重定向、鉴权入口和 locale 检测；Next 16+ 使用根级 `proxy.ts` / `proxyConfig`，不得继续新增 `middleware.ts`。

## Server Component Rules

- `page.tsx`、`layout.tsx` 和大多数 route segment 组件默认是 Server Component。
- Server Component 负责首屏数据、metadata 数据、服务端鉴权上下文读取、静态/动态渲染决策和传递最小 view model。
- Server Component 可以调用 `src/bff/routes` 或 `src/bff/services` 的 server-only 能力，但不能把 gateway 或后端 raw response 传给 Client Component。
- Server Component 读取内部数据时不得 `fetch('/api/...')` 自调同站 Route Handler；内部 read 走 `src/bff/services` 或项目定义的 server facade，避免服务端内回环 HTTP 和重复鉴权。
- 不在 Server Component 模块级保存 request/user/session/tenant 等可变状态。模块级只允许不可变配置、静态资源和有明确 key 隔离的缓存。
- 独立数据请求不要串行 `await`；用组件并行渲染、`Promise.all`、预加载或 Suspense streaming。

## Client Component Rules

- 只有浏览器 API、事件处理、客户端状态、动画、即时表单交互或客户端第三方库需要时才加 `'use client'`。
- `'use client'` 边界尽量下沉到叶子组件，不把整页默认变成 Client Component。
- Client Component 不能声明为 `async function`，不能返回 Promise，不能直接 `await` 服务端数据。
- Client Component 不导入 `src/bff/gateway`、server-only BFF helper、Node API、服务端环境变量或后端 SDK。
- 从 Server Component 传入 Client Component 的 props 必须是 JSON 可序列化数据；`Date` 转 ISO 字符串，`Map/Set` 转对象或数组，class instance 转 plain object。
- 只向 Client Component 传 UI 实际需要的字段，避免把完整后端对象或大 DTO 序列化进 RSC payload。
- 使用 `useSearchParams()` 的 Client Component 必须被最近的 `Suspense` 包住，避免静态路由整体 CSR bailout。
- 动态路由中使用 `usePathname()` 的 Client Component 必须被 `Suspense` 包住；已用 `generateStaticParams` 且目标 Next 版本确认不触发 bailout 时可以例外。
- Client Component 必须发起 GET 请求时，优先接收 Server Component 传入的 initial data，再用项目请求 hook、SWR 或 React Query 做去重和刷新；不要在 hydration 后无条件重复请求首屏数据。
- 内部导航使用 `next/link`，不要用普通 `<a href>` 做站内跳转；程序式导航只在事件处理、表单结果、modal 关闭或受控流程中使用 `useRouter()`。
- active nav 可用 `usePathname()`、`useSelectedLayoutSegment()` 或 `useSelectedLayoutSegments()`；动态路由下按 Suspense 规则处理。
- 需要展示 prefetch 状态时优先使用 `useLinkStatus()` 或项目导航 wrapper，不在多个组件里重复实现 Link 预取状态。

## MUI And Style Runtime

- MUI、Emotion/cache provider、ThemeProvider、CSS layer、Tailwind 共存、暗色模式防闪烁、图标依赖和 UI bundle 规则统一见 `references/ssr-ui-runtime.md`。
- 本文件只保留 RSC 归属原则：MUI-heavy UI 下沉到叶子 Client Component，`page.tsx` / `layout.tsx` 仍负责服务端数据、metadata、鉴权和缓存策略。

## Next Async APIs

- Next 15+ 中 `params`、`searchParams`、`cookies()`、`headers()` 按 async API 处理。
- `page.tsx`、`layout.tsx`、Route Handler、`generateMetadata` 中的 `params` / `searchParams` 类型使用 `Promise<...>` 并 `await`。
- 同一项目内不得混用 Next 14 同步写法和 Next 15 async 写法；以项目当前 Next 版本为准。
- 需要同步组件消费 async request API 时，使用 React `use()`，不要在 Client Component 中绕过服务端边界。

## Route Handlers

- Route Handler 运行在服务端环境，可以读取 `Request`、headers、cookies、params 和 body，但不能使用 React hooks、React DOM 或浏览器 API。
- Route Handler 支持 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD`、`OPTIONS`；未实现 method 应返回稳定 405 或项目统一错误。
- Route Handler 只做入口编排：读取请求上下文、生成/透传 request id、鉴权、参数整理、调用 BFF route/action facade、返回稳定 JSON/headers/status。
- 动态 route 的 params 按项目 Next 版本处理；Next 15+ 写成 `{ params }: { params: Promise<{ id: string }> }`。
- GET Route Handler 的缓存语义必须显式：公开可缓存数据声明 cache header 或 revalidate 来源；登录态数据默认 no-store。
- webhook、外部 REST、移动端 API、第三方回调、健康检查使用 Route Handler；UI 内部 mutation 优先 Server Action。
- Route Handler 不用于 Server Component 内部读数据，不作为页面层 service 的默认中转；只有浏览器、外部系统、webhook、移动端、公开 REST 或 HTTP cache 契约需要时才暴露。
- Route Handler catch 块中如果捕获到 Next 导航异常，必须用 `unstable_rethrow(error)` 或等价方式重新抛出。

## Server Actions

- Server Action 文件顶部使用 `'use server'`，只服务当前 Next UI 的 mutation。
- Server Action 必须鉴权、校验输入、调用 BFF service/gateway、返回稳定 action result，并在成功后按影响范围 revalidate。
- Server Action 不返回 token、后端 raw response、异常堆栈、邮箱/手机号/密码等敏感信息。
- 需要公开 HTTP 契约或非 Next 调用方访问时，不使用 Server Action。
- `redirect()`、`permanentRedirect()`、`notFound()`、`unauthorized()`、`forbidden()` 不得被普通 `try-catch` 吞掉；在 catch 中统一调用 `unstable_rethrow(error)` 后再处理业务错误，或把导航调用放在 try-catch 外。

## Error And Status Pages

- `error.tsx` 必须是 Client Component，接收 `{ error, reset }`，并提供可恢复操作或明确的 fallback。
- `global-error.tsx` 必须是 Client Component，且返回完整 `<html>` 和 `<body>`。
- `not-found.tsx` 用于 404 或业务对象不存在；页面或 BFF read 能力确认资源不存在时调用 `notFound()`。
- 登录态缺失优先使用 `unauthorized()` 或项目统一 redirect；权限不足使用 `forbidden()`；对应 `unauthorized.tsx` / `forbidden.tsx` 应提供稳定 UI。
- 错误页、未授权页、无权限页和 not-found 页的用户可见文案必须走 locale 字典。

## Metadata And Runtime Assets

- `metadata` 和 `generateMetadata` 只在 Server Component 中使用；若页面需要客户端交互，把交互拆到子组件。
- 同一数据同时用于 metadata 和页面时，用请求级缓存或共享 BFF read 方法去重。
- 公开页面必须定义 title、description、canonical/alternates、robots 策略；内容详情页按业务需要生成动态 metadata。
- 多语言或跨区域公开页面默认不输出 locale route 形式的 `alternates.languages` / hreflang；只有项目另行定义稳定多语言 URL 策略时才输出。
- `viewport` / `generateViewport` 与 `metadata` 分开定义；根 layout 统一 title template 和默认 metadata。
- 静态 SEO 资源优先使用 App Router file conventions：`favicon.ico`、`icon.*`、`apple-icon.*`、`opengraph-image.*`、`twitter-image.*`、`robots.ts`、`sitemap.ts`、`manifest.ts`。
- 大型站点 sitemap 使用 `generateSitemaps()` 分片；多张动态 OG 图使用 `generateImageMetadata()`，避免把全部 URL 或图片一次性塞进单个函数。
- OG 图使用 Next 内置 `next/og`；不要为了 OG 图默认切 Edge runtime。
- OG 图不能依赖 search params；需要动态内容时使用 route params 或服务端数据源。
- 图片使用 `next/image`，远程图配置 `remotePatterns`，`fill` 必须配 `sizes`，首屏 LCP 图才加 priority。
- `next/image` 远程图必须配置 `remotePatterns`；静态导入本地图优先；`output: 'export'` 时必须声明 `unoptimized`、custom loader 或等价图片方案。
- 字体使用 `next/font` 或项目既有字体方案；避免运行时外链字体导致首屏抖动。
- 字体只在 layout 或共享字体模块初始化一次；不要在普通组件里重复调用 `next/font`；Google/local font 必须声明必要 subset、weight、display 或 CSS variable 策略。
- 第三方脚本使用 `next/script` 或 `@next/third-parties`；内联 `Script` 必须有稳定 `id`，不要把 `Script` 放进 `next/head`。
- `beforeInteractive` 只用于真正阻塞首屏且必须先执行的脚本，并放在根 layout；分析、日志、营销脚本默认 `afterInteractive`、`lazyOnload`、采样或用户同意后加载。
