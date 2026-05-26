# SSR BFF Boundaries

## BFF Goals

- BFF 是 Next SSR 应用到后端 HTTP 服务或 Prism mock 的唯一服务端业务出口。
- BFF 隔离后端 DTO、统一响应 wrapper、错误结构、鉴权 header、request id、缓存策略和 mock/真实服务切换。
- BFF 输出前端稳定 view model，页面和组件不依赖后端字段名、Java envelope、数据库字段或 Prism example 的临时形状。
- BFF 不承接数据库、Redis、MQ、邮件、供应商同步、支付轮询、库存履约、定时任务或后台 worker。

## Directory Responsibilities

```text
src/bff/
  gateway/      # 唯一真实出站请求层
  services/     # 业务能力编排
  adapter/      # 后端 DTO -> 前端 view model
  routes/       # Route Handler facade
  actions/      # Server Action facade
  dto/          # app-local BFF DTO；复用 DTO 按目标项目契约目录放置
  shared/       # BFF-only pure helper
  transform/    # headers、session、request context 转换
```

- `gateway`：按 endpoint contract 选择 method/path/baseUrl/cache/timeout，注入 request id、authorization、locale、tenant 等 headers，校验 response wrapper 并脱敏错误。
- `services`：组合单个业务用例，调用 gateway，处理业务缺省、状态转换、幂等和跨 endpoint 编排；每个上游调用必须标注 `required`、`degradable` 或 `optional`。
- `adapter`：只负责 DTO 到 view model 的映射、字段兼容、枚举归一、展示模型稳定化；不发请求，不读 cookies，不写缓存。
- `routes`：给 Route Handler 使用的 facade，负责 request/query/body/cookie/header 到 service input 的转换。
- `actions`：给 Server Action 使用的 facade，负责 formData/typed input 到 service input 的转换和 revalidation plan。
- `shared`：只放 BFF 内部纯函数，例如 request id、cookie 解析、稳定 JSON response、脱敏 logger、会话轻量模型转换。

## Import Direction

- `src/app/**/route.ts` 只导入 `src/bff/routes/**` 或极少量同目录参数 helper。
- Server Action 入口只导入 `src/bff/actions/**` 或 `src/bff/services/**` 中已声明可供 action 使用的能力。
- Server Component 可以导入 `src/bff/services/**` 的 read 能力；若项目要求更严格，应统一经 `src/bff/routes/**` 或 server facade。
- `src/features/**` 和 Client Component 不导入 `src/bff/**`，除非目标项目明确提供浏览器安全的 BFF client wrapper。
- `src/bff/services/**` 可以导入 `gateway`、`adapter`、`dto`、`shared`；不能导入 `src/app/**` 或 Client Component。
- `src/bff/gateway/**` 不导入 UI、React component、route handler 或 adapter；它只关心契约、请求、响应和错误。

## Route Handler Rules

- 允许：读取 `Request`、headers、cookies、query、path params、body；生成 request id；读取轻量会话；调用 BFF route facade；返回稳定 JSON、status 和 cache header。
- 禁止：导入 DB/Redis/MQ/供应商 SDK/邮件 SDK/旧 server lib；直接请求后端 base URL；直接请求 Prism；返回后端 raw DTO；实现长业务流程或后台任务。
- 迁移旧 Route Handler 时，只搬迁当前入口真正需要的纯 helper；不要一次性把旧 server 目录搬进 `shared`。
- 仍有基础设施副作用的旧代码不能进入 BFF shared，只能由后端接口、专门迁移任务或受控 legacy 缺口承接。

## Gateway Rules

- gateway 必须从 endpoint id 或 contract 获取 method/path/cache/auth 配置，不在 service 中散落 URL 字符串。
- gateway 负责 baseUrl 选择：mock/dev/test/prod 通过环境配置切换，不在页面、组件或 service 中判断目标域名。
- gateway 注入 `X-Request-Id` 或项目等价 trace header；若请求已有 request id，优先透传。
- gateway 做 timeout、HTTP non-2xx、业务 code、malformed wrapper、网络错误和 JSON parse 错误的归一化。
- gateway 错误对象不得包含 token、cookie、密码、完整邮箱/手机号、后端堆栈或供应商敏感响应。
- gateway 可以实现请求级 dedupe 或框架 fetch cache，但必须尊重用户态、租户态、语言、币种和权限维度。
- gateway 必须记录每次上游调用的 endpoint id、method、path、duration、status、业务 code 和 request id；日志中不得输出完整 token、cookie 或敏感 payload。
- 统一 logger、普通日志/接口日志字段、client/server transport、级别、trace 透传、脱敏、生产 client console、PM2、审计事件和 Web Vitals 按 `references/ssr-observability-and-logging.md` 执行。

## Degradation And Observability

- `required` 上游失败时当前 BFF 能力失败，返回稳定错误 wrapper 和 request id。
- `degradable` 上游失败时返回业务认可的兜底值，并记录降级原因、endpoint id 和 request id。
- `optional` 上游失败时可以省略对应字段，但 adapter 输出的 view model 必须保持结构稳定或明确字段可选。
- 可降级和可缺省调用必须局部 `try-catch`，不能让单个非必需上游拖垮整个 BFF response。
- Route Handler 必须输出入口日志、上游调用摘要和异常日志；日志字段至少包含 service、span、path、method、request id、user/guest 标识、duration、status 和 upstream calls。
- Route Handler 和 Server Action 不直接拼接非结构化日志字符串，应通过统一 logger/context helper 输出结构化日志；接口日志必须包含时间、request id、用户 id、cookie 摘要、接口地址、入参摘要、出参摘要、状态和耗时。
- BFF 默认性能预算：单次响应 P99 目标小于 500ms；单个 Route Handler 上游调用数不超过 5 个，超过时优先拆 endpoint、引入批量接口或调整页面数据岛。
- 非阻塞日志、审计和分析可以使用 Next `after()`；核心业务副作用、支付、订单状态推进、库存履约和必须成功的写操作不能放到 `after()`。

## Auth And Session

- 浏览器会话可以来自 cookies/headers，但后端契约使用 `authorization: <backend-token>` 或项目等价服务端 header。
- BFF 负责把 web/admin session 转换为后端 authorization header；token 不进入 Client Component props 或 JSON response。
- 缺少会话返回稳定 401；权限不足返回稳定 403；不要把后端鉴权 raw error 直接透出。
- 登录、登出、刷新 token、清 cookie 等逻辑必须集中在 BFF route/action facade 或 BFF shared helper，不能散落在多个 Route Handler。

## Legacy And Backend Gap

- legacy catch-all 只能返回受控缺口状态和 request id，不能继续执行旧 DB/Redis/MQ/供应商逻辑。
- `backend-gap` 只能标注契约和实现缺口；mock 环境仍应提供旧业务验收所需的默认成功 example。
- 当后端缺口影响真实环境时，在 handoff 中标注能力状态、阻塞点、降级行为和后续后端接口需求。
