# SSR Cache And Performance

## Rendering Mode Policy

- 公开、低频变化、无用户态差异的数据可以静态生成、ISR、`revalidate` 或 tag cache。
- 登录态、权限态、账户、订单、支付、风控、后台操作、租户隔离数据默认动态渲染或 `no-store`。
- 同一路由如果混合公开数据和用户态数据，缓存必须按用户态最严格边界处理，或拆分为独立 server/client 数据岛。
- 内容受 locale 影响时，cache key/tag 必须包含 locale；未做隔离时使用 dynamic/no-store。
- 每个页面 handoff 必须说明 static、ISR、dynamic、no-store 或 tag-based revalidation 的选择依据。

## Revalidation Rules

- mutation 成功后按业务影响选择 `revalidateTag`、`revalidatePath` 或客户端局部刷新。
- 不用全站粗暴刷新替代精确失效；tag 应按业务对象、租户、语言、币种、权限维度设计。
- 语言切换只刷新当前页面相关接口和当前 locale 相关 cache key/tag；不得用全站 revalidate 或整页 reload 替代。
- revalidation 计划应由 BFF service/action 返回或集中定义，避免在多个 UI 入口散落。
- webhook 或后台回调触发的 revalidation 必须先校验来源和签名，再刷新缓存。
- 使用 Next Cache Components 或 `'use cache'` 前，必须确认 `cacheComponents` 配置、cache profile、`cacheLife()`、`cacheTag()` 和失效策略；不把实验性缓存能力当默认基础设施。

## Waterfall Prevention

- 独立请求并行执行，用 `Promise.all`、组件并行渲染、Suspense streaming 或 preload pattern。
- cheap sync condition 先判断，再 `await` 远程 flag、权限或配置。
- API Route/Route Handler 中尽早启动独立 promise，最后统一 await。
- 嵌套列表的 item 级请求用批量 endpoint 或 `Promise.all`，不要逐项串行。
- 同一个 request 内重复认证、配置、文件读取或非 fetch 异步工作，用 `React.cache()` 或项目等价请求级 dedupe。

## RSC Serialization

- Server -> Client props 只传客户端实际使用字段，避免把完整后端对象序列化进 HTML/RSC payload。
- 大列表优先在 Server Component 渲染可读内容；只把筛选、分页、选中项、表单草稿等交互状态下沉到 Client Component。
- 日期、金额、枚举等展示字段优先在服务端归一为稳定字符串或轻量 model，再传给客户端。
- 不传 token、权限全集、后端错误详情或不需要的审计字段到客户端。

## Bundle Rules

- 避免 barrel import 扩大 client/server bundle；Next 项目优先用 `optimizePackageImports` 处理大型 UI/icon 包。
- 重组件、图表、编辑器、地图、Monaco、富文本、Lottie 等不在首屏必需时用 `next/dynamic` 懒加载。
- 依赖 `window`、`document`、`localStorage` 的库必须包在 Client Component 或 `dynamic(..., { ssr: false })` 中。
- 不在 Server Component 中导入浏览器专用库；不在 Client Component 中导入 Node-only 包。
- 使用原生依赖、ESM/CJS 兼容性差或服务端打包异常的包时，在 `next.config.*` 中评估 `serverExternalPackages` 或 `transpilePackages`，不要用临时动态 require 绕过。
- CSS 通过 import、CSS Modules 或项目样式系统进入 Next 构建；不要在组件里手写 `<link rel="stylesheet">` 加载本地 CSS。
- 不加载冗余 polyfill CDN；Next 已内置常见 polyfill，额外脚本只允许有明确兼容目标和体积说明。
- 第三方分析、日志和营销脚本用 `next/script` 或项目封装，并延后到 hydration 后或用户同意后加载。
- Next 项目应在 `next.config.*` 中评估 `optimizePackageImports`，候选包括 MUI、MUI icons、lucide、Radix、Headless UI、date-fns、lodash 等大型 re-export 包。
- MUI 项目优先使用稳定的直接导入或 `optimizePackageImports`；禁止从项目级 UI barrel 一次性 re-export 大量 MUI 组件、icons、theme helper 到性能敏感路径。
- MUI icons 默认按需直接导入；业务图标优先保留少量 `lucide` 或项目图标库，不为少量图标引入整套额外 icon bundle。
- MUI 与 Tailwind v4 共存时，CSS layer 配置必须进入运行资产策略；样式优先级异常不得通过重复 `!important` 或组件内临时 `<style>` 处理。
- 性能敏感路径禁止从项目级 barrel file 批量导入组件、hooks 或工具；需要保留 barrel 时，必须证明不会扩大 client bundle 或 server trace。
- 大型依赖、图表、编辑器、地图和营销脚本变更后，交付说明应包含 bundle analyzer、chunk 摘要或明确的未验证风险。
- Next 16.1+ 可用 `next experimental-analyze` 或项目等价 analyzer 输出 client/server bundle 证据；低版本使用项目已有 bundle analyzer。

## Client Data Fetching

- Client Component 默认不在 hydration 后重复请求 Server Component 已经拿到的首屏数据；需要刷新时传 initial data 给 SWR、React Query 或项目请求 hook。
- 客户端 GET 请求必须有去重、取消或过期策略；不要在多个 sibling Client Component 中重复请求同一 endpoint。
- 客户端 mutation 优先使用 Server Action；需要公开 HTTP、上传、第三方调用或非 Next 客户端访问时才使用 Route Handler。
- localStorage/sessionStorage 中只保存最小客户端偏好或草稿数据，并使用版本字段处理 schema 变化；不保存 token、权限全集或敏感业务对象。

## Server Runtime

- 默认使用 Node.js runtime。只有明确边缘延迟需求、依赖兼容且项目已有部署支持时才使用 Edge runtime。
- request/user/session/tenant 等可变数据不放模块级变量，避免并发请求串数据。
- 模块级只放不可变配置、静态资源、编译期常量或有明确 key 隔离的跨请求缓存。
- `after()` 只用于非阻塞日志、审计、分析、通知或清理；不能把必须成功的核心业务副作用放到响应之后。

## Deployment And Self Hosting

- 容器或自托管部署优先使用 Next `output: 'standalone'`，并在镜像中复制 `.next/static` 和 `public`。
- 传统服务器或 PM2 部署也优先运行 `.next/standalone/server.js`；必须确认 `.next/static` 和 `public` 被复制到 standalone 工作目录。
- PM2 cluster 模式必须声明 `instances`、`exec_mode`、`PORT`、`HOSTNAME`、`NODE_ENV`、日志策略和健康检查；多实例缓存按共享 cache handler 或禁用策略处理。
- 多实例部署使用 ISR、tag cache、`revalidatePath` 或 `revalidateTag` 时，必须声明共享 cache handler、共享存储或明确禁用会造成实例间不一致的缓存模式。
- 文件系统默认缓存只适合单实例或可接受短暂不一致的场景；多实例正式环境不得依赖本地磁盘保证 ISR 一致性。
- 健康检查 Route Handler 应返回稳定 JSON/status，不依赖后端慢调用；深度依赖检查另建受控诊断入口。

## Hydration And Rendering

- 避免用随机数、当前时间、浏览器宽度或 localStorage 初始值直接造成 hydration mismatch。
- DOM id 使用 React `useId()` 或服务端稳定 id，不用 `Math.random()` / `Date.now()` 生成首屏 id。
- 避免无效 HTML 嵌套，例如 `div` 放进 `p`、`p` 内嵌 `p`；hydration 错误先检查 HTML 结构、时间/随机值、浏览器 API 和第三方脚本。
- 客户端专属数据需要延后到 effect、用稳定 placeholder，或在确实预期不一致时局部 `suppressHydrationWarning`。
- MUI 主题、颜色模式、media query 和 responsive 分支必须避免服务端与客户端初始值不一致；需要依赖浏览器状态时使用 SSR-safe 默认值、CSS variables 或延后到局部 Client Component。
- MUI SSR 页面需要检查首屏样式闪烁、Emotion style 顺序和 Tailwind layer 覆盖；出现 FOUC 时先审计 `AppRouterCacheProvider`、ThemeProvider 位置和 CSS layer，而不是把页面整体改为 CSR。
- 长列表使用分页、虚拟化或 `content-visibility`；不要把大量不可见 DOM 首屏下发。
- 静态 JSX、正则、映射表和默认非 primitive props 适当 hoist，避免重复创建导致 re-render。
