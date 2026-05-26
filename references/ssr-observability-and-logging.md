# SSR Observability And Logging

## Goals

- SSR / BFF 项目必须提供可追踪的请求证据链：浏览器请求、Route Handler、Server Component read、Server Action、BFF service、gateway 上游调用、缓存命中、降级和异常都能用同一个 request id 串起来。
- 日志和观测只服务排障、性能、审计和业务验收；不得把 token、cookie、密码、完整手机号/邮箱、支付敏感字段、后端堆栈或供应商原始敏感响应写入日志。
- 本规则定义前端 SSR/BFF 侧的日志与可观测性边界，不替代后端 APM、数据仓库、BI 埋点或安全审计平台规范。

## Signal Types

- `request_log`：Route Handler、Server Action、Server Component 服务端 read 的入口和出口摘要。
- `interface_log`：BFF 对外 Route Handler、Server Action mutation、gateway 调后端或 Prism 的接口调用摘要。
- `upstream_log`：gateway 调后端或 Prism 的出站摘要；属于 `interface_log` 的服务端上游子类。
- `error_log`：未捕获异常、业务错误、契约错误、上游错误、解析错误和超时。
- `degradation_log`：`degradable` 或 `optional` 上游失败后的降级、缺省和局部兜底。
- `cache_log`：static、ISR、tag/path revalidation、`no-store`、请求级 dedupe 和 cache miss/hit 证据。
- `audit_event`：登录、登出、权限拒绝、重要 mutation、敏感配置变更等需要留痕的用户行为。
- `web_vitals`：LCP、CLS、INP、TTFB、FCP 等前端体验指标。
- `client_error`：浏览器运行时错误、hydration warning、资源加载失败和关键交互失败。

## Unified Logger Layer

- SSR 项目应提供统一日志层，推荐落点为 `packages/tools/logger`；如果项目没有共享 packages 目录，可以先落到 `src/shared/logger` 和 `src/bff/shared/logger`，但 API 设计应保持后续可迁移。
- 统一日志层至少暴露 server 与 client 两类入口：`serverLogger` 面向 Node.js `process` / stdout / stderr / PM2，`clientLogger` 面向浏览器 console、远程采集或 no-op。
- 业务代码、Route Handler、Server Action、gateway、Client Component 不直接调用裸 `console.log` / `console.error`；本地调试也应经 logger，以便生产自动降噪和脱敏。
- logger 包负责生成时间、归一化 level、合并 request context、脱敏敏感字段、格式化普通日志和接口日志，并按运行时选择 transport。
- logger 包不持有 React request/user/session 的模块级 mutable state；request context 必须作为参数显式传入或由框架安全上下文读取。

推荐包职责：

```text
packages/tools/logger/
  server/       # Node.js / Next server / PM2 stdout stderr transport
  client/       # browser console / remote transport / production no-op
  core/         # schema、level、redaction、serializer、request id helper
  types/        # shared log event types
```

这只是日志工具包边界，不定义 monorepo、workspace、发布或跨应用依赖治理。

## Runtime Matrix

| Runtime | Local behavior | Production behavior |
| --- | --- | --- |
| Server / process | 输出结构化 JSON 到 stdout/stderr，可按需 pretty print | 输出单行 JSON 到 stdout/stderr，由 PM2 或日志平台采集 |
| Client / browser | 允许 `clientLogger` 转发到 console，便于调试 | 默认禁止 console 输出；只允许采样后的远程错误、Web Vitals 或业务允许的事件 |
| Route Handler / Server Action | 记录入口、接口、异常、降级、审计摘要 | 同本地，但必须脱敏、采样并带 release/build/env |
| Gateway upstream | 记录接口地址、入参/出参摘要、状态和耗时 | 记录白名单入参/出参摘要，不记录完整敏感 payload |

生产环境 Client Component 中的 console 必须自动清除或禁用：

- 构建层启用项目等价的 console 移除能力，例如 Next compiler `removeConsole`、SWC/Babel 插件、Terser 或 ESLint `no-console` 门禁。
- `clientLogger` 在 production 默认不调用 console；如需上报，走远程 transport，并执行采样、脱敏和用户同意策略。
- `console.warn` / `console.error` 的生产保留只能作为受控例外，例如框架错误边界诊断或监控 SDK 内部行为，并应在 handoff 中说明。

## Required Context Fields

所有服务端日志至少包含：

- `timestamp`：ISO 时间。
- `level`：`debug`、`info`、`warn`、`error`。
- `service`：应用或前端服务名。
- `env`：`mock`、`dev`、`test`、`staging`、`prod` 或项目等价环境。
- `requestId`：入口生成或透传的请求 id。
- `traceparent`：存在上游 trace 时透传；没有时不强造虚假链路。
- `span`：`route_handler`、`server_component`、`server_action`、`bff_service`、`gateway`、`adapter` 等。
- `routeId`：页面路由、API 路由或业务能力标识，避免只记录动态 path。
- `method`、`path`、`status`、`durationMs`：入口或出站请求摘要。
- `endpointId`、`operationId`：有契约的 BFF/gateway 调用必须记录。
- `actorType`：`guest`、`user`、`admin`、`system` 或项目等价值。
- `userId`、`tenantId`、`locale`、`currency`：仅在业务允许且已脱敏或属于内部非敏感标识时记录。
- `cacheMode`、`cacheStatus`、`revalidateTarget`：涉及缓存或 revalidation 时记录。

## Minimum Log Schemas

普通日志至少包含：

- `timestamp`：ISO 时间。
- `level`：日志级别。
- `requestId`：当前请求 id；客户端无法获得时可为空，但应在后续接口返回后补齐上下文。
- `userId`：已登录用户标识；匿名用户用 `guest` 或留空。
- `message`：稳定英文或拼音事件摘要，不使用易变 UI 文案。
- `context`：可选结构化上下文，只允许白名单字段。

接口日志至少包含：

- `timestamp`：ISO 时间。
- `level`：通常为 `info`；失败、降级或异常时按规则升为 `warn` / `error`。
- `requestId`：入口或透传 id。
- `userId`：已登录用户标识；不得记录完整用户资料。
- `cookie`：只记录 cookie key、是否存在、过期状态或脱敏摘要；生产环境禁止记录完整 cookie value。
- `url`：接口地址或 path template；生产环境优先记录 path template，避免 query 泄漏敏感信息。
- `method`：HTTP method 或 action 类型。
- `requestParams`：入参摘要；只允许白名单字段，超长字段截断，敏感字段脱敏。
- `responseParams`：出参摘要；只允许状态、业务 code、必要 id、数量、分页、错误 key 等白名单字段。
- `status`、`code`、`durationMs`：HTTP 状态、业务 code 和耗时。

接口日志中的入参/出参不是完整抓包。完整 payload 只允许在本地显式 debug 开关下短期输出，且不得进入提交代码、CI、PM2 或线上日志。

## Logger Ownership

- SSR 项目应通过 `packages/tools/logger`、`src/bff/shared/logger` 或目标项目等价目录提供统一 logger/context helper；不要在 Route Handler、service、gateway 中各自拼 `console.log` 字符串。
- Route Handler 负责创建或透传 `requestId`、读取轻量 session、形成 request context，并把 context 传给 BFF route facade。
- Server Component 调 BFF read 能力时必须能获得 request context；不能通过模块级 mutable state 保存当前请求。
- Server Action 负责记录 mutation intent、鉴权结果、输入校验结果、revalidation plan 和最终 action result；不要记录完整 formData 或敏感字段。
- gateway 负责记录每次上游调用摘要：endpoint id、operationId、method、path template、duration、HTTP status、业务 code、timeout、retry、request id。
- adapter 默认不写日志；字段兼容或枚举兜底若影响业务含义，应由 service 记录一次结构化兼容事件。

## Levels And Events

- `debug`：仅本地或临时诊断使用；生产默认关闭或采样，不记录用户 payload。
- `info`：正常入口完成、上游完成、cache hit/miss、revalidation 成功、关键业务流程完成。
- `warn`：可降级上游失败、optional 缺失、backend gap 命中、契约兼容兜底、权限拒绝、cache 不一致风险。
- `error`：required 上游失败、未捕获异常、malformed wrapper、JSON parse 失败、timeout、Server Action mutation 失败。
- 业务审计事件使用稳定 `eventName`，例如 `auth.login.succeeded`、`auth.login.failed`、`order.submit.succeeded`、`permission.denied`；不要把中文 UI 文案当事件名。

## Redaction And Privacy

- 默认禁止记录完整值：`authorization`、`cookie`、`set-cookie`、password、token、secret、完整手机号、完整邮箱、身份证、银行卡、支付凭证、供应商原始敏感 payload。
- `cookie` 字段可出现在接口日志中，但只能记录 cookie key、存在性、过期状态、长度或不可逆摘要；生产环境不得记录完整 cookie value。
- header、query、body、response 只能白名单记录；不允许把完整 request/response 对象直接 JSON stringify。
- 错误对象输出前必须归一化：只保留错误类型、业务 code、HTTP status、endpoint id、message key、request id 和必要的安全摘要。
- 客户端日志不得携带服务端 session token、后端 authorization header、权限全集或用户完整资料。

## Tracing And Propagation

- 入口若已有 `X-Request-Id`、`x-request-id`、`traceparent` 或项目等价 trace header，应优先透传并校验长度/格式。
- 入口缺少 request id 时由 BFF 生成稳定 id，并在 JSON response header/body 的安全位置返回，方便 QA 和用户反馈定位。
- gateway 出站请求必须携带 request id 和 trace header；后端返回的 request id 不一致时记录 `upstreamRequestId`，不要覆盖当前 SSR request id。
- 多个独立上游并行时，每个 upstream log 记录自己的 span/duration，并在入口完成日志中汇总 upstream count、slowest endpoint 和失败/降级数量。

## Performance And Web Vitals

- SSR 入口日志必须记录服务端 duration；BFF gateway 记录上游 duration；页面 handoff 中说明 P95/P99 或项目采用的性能预算。
- Web Vitals 通过项目约定的客户端上报入口收集；至少区分 routeId、device class、connection type、navigation type 和 build version。
- 第三方日志、分析和 session replay 脚本不得阻塞首屏；使用 `next/script`、延迟加载、采样或用户同意策略。
- 大型日志 SDK 不能进入 Server Component 或首屏 Client Component bundle；必要时动态加载或在服务端统一发送。

## Audit Events

- 审计事件和普通排障日志分开建模；审计事件要求稳定 eventName、actor、target、action、result、requestId、timestamp。
- 权限拒绝、登录失败、重要 mutation、导出、批量操作、敏感配置变更应记录审计事件。
- 审计事件只能记录业务必要字段；敏感详情留在后端审计系统或受控安全平台，不在 SSR 日志中扩大暴露面。
- `after()` 可用于非阻塞审计投递，但不能承载必须成功的订单、支付、库存、账户状态等核心业务副作用。

## Runtime And Tooling

- 项目可以选择 console JSON、OpenTelemetry、Sentry、Datadog、Axiom、云厂商日志或既有平台；本规范只要求统一字段、脱敏和传递边界。
- 使用 Next `instrumentation.ts` 时，只做运行时初始化、全局错误/trace SDK 注册或轻量配置；不要在其中放业务规则或请求态变量。
- source map 上传、release version、build id、commit sha 应进入客户端错误和 Web Vitals 上下文，便于定位线上版本。
- 日志采样、保留周期、跨境/合规策略按项目或公司平台执行；SSR 规范只要求在 handoff 中声明当前项目采用的策略或缺口。

## PM2 Production Logging

生产环境若使用 PM2 启动 Next 服务，日志方案必须明确：

- Next 服务日志输出到 stdout/stderr，由 PM2 采集；应用代码不直接写业务日志文件，避免多实例竞争、权限和轮转不一致。
- server logger 生产环境输出单行 JSON，字段内包含 `timestamp`、`level`、`service`、`env`、`requestId`、`pid`、`pmId`、`instanceId`、`release`、`message`。
- PM2 配置应区分 `out_file` 和 `error_file`，设置 `merge_logs`、实例名和环境变量；cluster 多实例时日志内必须包含实例标识。
- 使用 `pm2-logrotate`、云日志 agent 或平台等价能力做大小、保留天数、压缩和清理；不能依赖无限增长的默认日志文件。
- 如果日志平台要求 JSON line，避免 PM2 额外时间前缀破坏 JSON；时间由 logger 的 `timestamp` 字段提供。
- PM2 reload/重启、uncaught exception、unhandled rejection、进程退出和健康检查失败应输出 `process_event` 日志。
- `pm2 flush`、手工删除日志、临时 debug level 只能作为运维操作，不应成为日常问题定位方案。

推荐 handoff 至少说明：

- `ecosystem.config.*` 的应用名、实例数、env、日志路径和 logrotate 策略。
- stdout/stderr 如何进入日志平台或本机归档。
- 生产 debug level、采样率、保留周期、敏感字段脱敏策略。
- PM2 cluster 下 request id、pid、pm id、instance id 的定位方式。

## Verification

- mock smoke 或 e2e 应至少验证一个成功请求携带 request id，一个上游失败返回稳定 request id，一个可降级失败写入降级日志。
- 边界测试或静态扫描应防止在业务代码中直接输出 token/cookie/password，防止 Client Component 导入服务端 logger。
- 生产构建或 lint 应验证 client console 被移除或禁止；若保留例外，必须列出原因和范围。
- PM2 部署项目应验证 stdout/stderr、out/error 文件、logrotate 或日志平台采集策略。
- 交付说明必须列出已接入的日志信号、统一 logger 落点、request id 传递方式、普通日志/接口日志 schema、敏感字段脱敏策略、Web Vitals/客户端错误是否接入、PM2 日志策略，以及未接入项的风险。
