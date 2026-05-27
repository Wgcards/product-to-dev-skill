# Monorepo Workspace Rules

## Scope

本规则用于 `product-to-dev-skill` 生成或改造包含多个应用、共享包、Web + App、多端复用、BFF + 前端共享契约，或未来可能拆分应用的项目。

已有项目的 workspace、包管理器、构建系统、发布流程和包边界优先；迁移到本规范前必须说明差异、影响范围、脚本变化、开发习惯变化和验证成本。

## Default Layout

新建 monorepo 默认使用 `apps/*` 和 `packages/*` 两个顶层域：

```text
apps/
  <app-name>/           # 应用域：SPA、SSR/BFF、App、admin、storefront 等可运行应用
packages/
  types/                # 共享 TypeScript 类型、DTO、契约类型、枚举/状态联合类型
  tools/                # 共享工具方法、业务方法、请求工厂、日志工厂、配置校验等
  ui/                   # 通用 UI 组件、业务 UI 组件、主题和可复用展示模式
```

允许按项目需要增加 `docs/`、`scripts/`、`configs/`、`packages/eslint-config`、`packages/tsconfig`、`packages/test-utils` 等目录，但不要为了显得完整创建空包。

除 `packages/types` 外，共享包默认预留 runtime 语义：

```text
packages/<package-name>/src/
  client/               # browser / Client Component / App client 可用内容
  server/               # SSR / BFF / Node-only 内容；无 SSR/server 需求时可以不建空目录
  shared/               # client/server 都安全的纯类型、常量、纯函数和无副作用能力
```

即使当前 `apps/*` 没有 SSR 应用，也建议至少保留 `client` 与 `shared` 的语义边界；后续接入 SSR/BFF 时，再补 `server` 入口和 exports，不需要重排整个共享包。`packages/types` 不需要 `client` / `server` / `shared` 分层。

如果某个 package 的能力天然同时适用于 server 和 client，且可以确定不会出现两端差异化实现，也可以不拆 `client` / `server` / `shared`，直接使用 `src/`。如果某个 package 明确只支持 server 或只支持 client，且不存在两端同时支持的场景，也可以直接使用 `src/`，但必须在 package 说明和 exports 中标明 runtime 归属。

## Workspace Baseline

- 新建 monorepo 默认使用 pnpm workspace。
- `pnpm-workspace.yaml` 至少包含 `apps/*` 与 `packages/*`。
- 使用 pnpm `catalog` 统一核心依赖版本；React、React DOM、Next.js、Vite、TypeScript、MUI、i18n、testing、lint、format、OpenAPI/mock 相关依赖不应在各 app 中随意漂移。
- 单 app 且没有共享包需求时，可以保持单包项目；一旦需要 Web SPA + SSR、Web + App、多后台、多品牌、多租户壳层、共享 DTO/UI/tools，优先采用 monorepo。
- 根目录只放 workspace、工具链、统一脚本和跨包配置；业务代码必须落在 `apps/*` 或 `packages/*`。
- 根 `package.json` 默认 `private: true`，暴露 `dev`、`build`、`check`、`lint`、`typecheck`、`format` 等聚合脚本；应用级命令保留在对应 `apps/<app-name>`。

## Single App Versus Workspace Sharing

- 单应用项目默认使用应用内 `src/shared` 作为共享域，可以包含当前应用自用的 `types`、`dto`、`tools`、`components`、`hooks`、`store` 和配置。
- 升级为 monorepo 后，每个 `apps/*/src/shared` 仍然存在，但只表示当前应用内共享能力。
- 跨应用复用能力必须升级到 `packages/*`：跨 app 类型/DTO 进入 `packages/types`，跨 app 工具/请求工厂/日志工厂进入 `packages/tools`，跨 app UI/业务 UI 进入 `packages/ui`。
- 不要为了“看起来通用”把单 app 能力提前上移；上移前必须有实际复用对象、稳定 API、消费者清单和回归验证范围。
- 也不要让跨 app 能力长期留在某个应用的 `src/shared` 中；这会把应用私有目录变成隐式平台包，后续迁移成本更高。

## Package Responsibilities

### `apps/*`

- 每个 app 是独立可运行、可构建、可部署的应用。
- SPA app 继续遵守 SPA lane 的 `src/app`、`src/features`、`src/shared`、`src/types/dto` 等本地边界。
- SSR/BFF app 继续遵守 SSR lane 的 `src/app`、`src/bff`、`src/features`、`src/shared`、`mock` 边界；BFF-only 代码不得上移到浏览器可消费包。
- App lane 项目在 App references 完成前只记录 monorepo 落点和共享契约需求，不默认创建 React Native / Expo 包。
- app 私有 DTO、UI、工具、mock 和配置不要提前上移到 `packages/*`；只有跨 app 复用或明确会被复用的能力才进入共享包。

### `packages/types`

- 放跨 `apps/*` 共享的 TypeScript 类型声明、DTO、view model、API envelope、endpoint id、错误码、状态联合类型和枚举语义。
- 不放运行时代码、请求实现、React 组件、Node-only helper、环境变量读取或副作用逻辑。
- 字段、枚举值、状态、单位、格式和可选条件必须与 OpenAPI、API 文档、mock examples、SQL 语义一致。
- TypeScript interface 使用 `I` 前缀；type alias 使用语义化 PascalCase，不强制 `T` 前缀；状态联合类型使用 `OrderStatus` 这类业务名。
- 只导出稳定契约；app 内部临时 UI state、表单 draft、组件私有 props 默认留在 app 或 feature 内。
- `packages/types` 不需要 `src/client`、`src/server`、`src/shared` 分层；使用清晰的类型/契约目录即可。

### `packages/tools`

- 放跨 app 复用的纯工具、业务工具、格式化、校验、请求工厂、日志工厂、配置解析、错误规范化和平台无关 helper。
- 浏览器、SSR server、Node 脚本、React Native 可用性必须显式分层；不能把 Node-only API 暴露给浏览器或 App 客户端。
- 请求工厂只提供通用能力，具体 base URL、鉴权上下文、BFF gateway、Prism 地址和业务 endpoint 仍由 app 或 BFF 注入。
- 日志工厂必须支持 request id、client/server 环境、脱敏和本地/生产输出差异；SSR/BFF 可在 `packages/tools/logger` 复用，但 server-only 传输实现不能被 Client Component 引入。
- 共享业务方法必须足够稳定，并标明适用业务域；不要把单 app 的 service 编排直接抽到 tools。

### `packages/ui`

- 放跨 app 复用的 UI primitives、布局片段、业务 UI 组件、主题 token、图标封装和可访问性模式。
- Web UI、SSR-safe UI、React Native UI 不能混在同一个无边界入口；需要时使用子入口或独立包，例如 `packages/ui/web`、`packages/ui/native`。
- 业务 UI 可以依赖 `packages/types` 的稳定 view model，但不得直接调用 APIClient、BFF gateway、Prism、数据库或读取 app env。
- 组件 copy 默认通过 app 的 i18n 注入，`packages/ui` 不硬编码业务展示文案；通用 aria label 或默认文案需要可覆盖。
- MUI-first Web 组件必须声明 ThemeProvider 依赖和 SSR 兼容性；不在共享 UI 中创建隐式全局 provider。

### Additional Shared Packages

- 额外共享包必须先说明职责为何不能放入 `types`、`tools` 或 `ui`，例如 `packages/contracts`、`packages/config`、`packages/test-utils`、`packages/eslint-config`。
- 新增额外共享包必须有明确理由。例如 `packages/config` 只有在 config 能力占比过大、继续放在 `packages/tools` 会削弱 tools 语义，并且配置规模已经值得单独维护时才应独立。
- 新增共享包同样遵守本规范的 runtime 语义；除前文明确允许直接使用 `src/` 的天然通用包或单端专用包外，应使用 `src/client`、`src/server`、`src/shared` 分层，不得创建一个无边界的 `src/index.ts` 聚合所有 client/server 内容。
- 共享包入口应通过 package `exports` 明确暴露，例如 `./client/*`、`./server/*`、`./shared/*`。server 入口不得被浏览器 app 或 Client Component 引入。
- 如果当前没有 SSR/server 消费者，可以只暴露 client/shared 入口；但 package 设计应避免未来添加 server 入口时破坏既有 import。

## Dependency Boundaries

- `apps/*` 可以依赖 `packages/types`、`packages/tools`、`packages/ui`。
- `packages/ui` 可以依赖 `packages/types`，谨慎依赖 `packages/tools` 中浏览器安全的子入口。
- `packages/tools` 可以依赖 `packages/types`，不得依赖 `packages/ui` 或任一 app。
- `packages/types` 不依赖其他 workspace 包。
- `packages/*/src/client` 可以依赖同包 `src/shared`，不得依赖同包 `src/server`。
- `packages/*/src/server` 可以依赖同包 `src/shared`，不得把 Node-only 能力重新导出到 client 入口。
- `packages/*/src/shared` 不依赖 client-only、server-only、React DOM、Next server APIs、Node APIs、环境变量或浏览器全局对象。
- 共享包不得反向依赖 `apps/*`；不得通过相对路径跨包导入源码。
- 跨包 import 使用包名和 `exports` 子路径，不使用 `../packages/...`。
- peer dependency 用于 React、React DOM、MUI 等宿主应用应统一持有的运行时依赖；共享包自身只声明必要 direct dependency。
- 跨包 API 先通过 package `exports` 暴露稳定入口，避免从 `src/internal` 深导入。

## Contracts, Mock, And DTO Ownership

- 单 app 私有契约可以留在 app 内，例如 `apps/storefront/mock/openapi.yaml` 与 app-local DTO。
- 多 app 共享契约应把稳定 DTO、endpoint id、envelope、错误码放入 `packages/types`，OpenAPI 仍需要有明确 source of truth。
- Prism/OpenAPI mock runtime 归各 app 所有；每个 app 通过自身根目录下的 `mock/openapi.yaml`、`mock/components/`、`mock/examples/` 和 Prism 脚本控制 mock，不创建独立 `apps/mock-server`。
- 不允许页面、组件或共享 UI 直接读取 OpenAPI example 作为运行时数据；必须通过 service、BFF 或 app request wrapper。
- DTO 变更必须同步检查 OpenAPI schema、API 文档、mock example、SQL 字段语义和所有引用 app。

## TypeScript And Build

- 根目录提供统一 `tsconfig.base.json` 或等价配置，app/package 通过 `extends` 继承。
- 跨包 path alias、package `exports`、TypeScript、lint、test、build 工具必须一致；不能只让编辑器能解析而构建失败。
- 包内源码默认输出到 `dist` 或由目标构建器直接消费；发布型共享包应声明 `main`、`module`、`types` 和 `exports`。
- 若使用 TypeScript project references、Nx、changesets 或独立发布流程，需要在 handoff 中说明原因、命令和缓存/发布边界；不要默认引入重型编排工具。
- 应优先用 workspace 级 `check` 聚合 lint、typecheck、format、contract check；再按影响范围运行 app/package 窄验证。

## Quality Tooling Inheritance

- 新建 monorepo 必须读取 `references/quality-tooling.md`，并采用根配置继承模式。
- 根目录提供 ESLint、Prettier、Commitlint、EditorConfig、TypeScript base config、lint-staged、Husky 和聚合脚本的基础配置。
- `apps/*` 和 `packages/*` 继承根配置，只在框架差异、runtime 差异、测试环境或发布目标需要时做局部扩展。
- 不要在每个 app/package 复制一套独立配置；如果必须偏离根配置，要在 handoff 中标记原因和影响范围。
- lint/import boundary 应覆盖跨包依赖、`src/client` 不依赖 `src/server`、`src/shared` 不依赖 runtime-only API、`apps/*` 不被 `packages/*` 反向依赖。

## Task Orchestration

- pnpm workspace、`pnpm --filter`、workspace scripts 和 catalog 是默认基线。
- Turbo/Turborepo 只在明确需要时加入，不作为 monorepo 默认依赖。
- 满足以下信号中的两个及以上时，才建议加入 Turbo：app/package 数量较多且 `check/build/test` 明显重复耗时；CI 需要 task graph、缓存或 affected build；多个 app 共享 packages 且变更影响面需要自动计算；团队有远程缓存或稳定 CI 能维护缓存策略。
- 只有一个信号或只是“未来可能变复杂”时，先不引入 Turbo；使用 pnpm filter 和清晰脚本即可。
- 如果引入 Turbo，必须声明 `turbo.json` pipeline、缓存输入输出、环境变量传递、mock/contract check 是否缓存、CI 命令和禁用缓存的排障方式。

## Optional E-Commerce Platform Recommendations

以下规范仅在项目明确是电商平台、商城、批发平台、卖家中心、运营后台或类似业务时作为推荐项，不强制。若 `apps/*` 只是简单的 `admin` 和 `seller-center`，可以继续使用通用 app 分层。

- app 分层可按渠道和角色拆分，例如 `apps/storefront`、`apps/admin-console`、`apps/seller-center`、`apps/mobile`；简单后台可保持更少 app。mock 不作为独立 app，仍由各应用根目录的 `mock/openapi.yaml` 和 Prism 控制。
- 核心领域建议明确边界：商品、类目、库存、价格、购物车、订单、支付、退款、履约、物流、会员、商家、营销、内容、风控、售后。
- 跨端共享的商品、订单、支付、库存、会员、营销 DTO、endpoint id、错误码和状态语义应进入 `packages/types` 或项目批准的 `packages/contracts`。
- 金额、货币、地区、语言、税费、价格展示、时间和单位格式建议沉淀到 `packages/tools/src/shared` 或 `src/client` 安全入口；不要把真实定价、库存扣减或支付安全逻辑放到 UI 包。
- `packages/ui` 可按使用面拆子入口，例如 admin、seller、storefront、native；不要让后台运营组件、C 端商城组件和移动端组件混在同一个无边界入口。
- storefront 或公开商品/内容页面命中 SSR lane 时，server-only 商品详情预取、SEO metadata、缓存和 BFF gateway 必须留在 SSR app 或 server 入口，不能泄漏到 client/shared。
- admin、seller、buyer、merchant、tenant 等身份和权限语义建议统一建模；各 app 可以有本地权限适配，但不应各自创造冲突的身份字段。
- 多 app 共享业务契约时，应声明各 app 的 `mock/openapi.yaml` source of truth、Prism 启动脚本、端口、contract check、endpoint 覆盖矩阵和未实现 backend gap；不得通过独立 mock-server app 绕过应用级 mock 归属。
- 电商平台的订单、支付、退款、库存、优惠券、风控等状态机需要在 API 文档、DTO、mock examples、SQL 和 UI 状态文案之间保持一致。

## Delivery Gates

- 新建 monorepo 必须交付 `pnpm-workspace.yaml`、根 `package.json`、catalog 版本策略、apps/packages 职责说明和验证命令。
- 每个共享包必须说明 owner、消费者、允许依赖、禁止依赖、入口 exports 和验证方式。
- 每个 app 必须说明它选择 SPA、SSR 或 App lane 的原因，以及依赖哪些 workspace packages。
- 除 `packages/types` 外，采用 runtime 分层的共享包必须说明 `src/client`、`src/server`、`src/shared` 的可用入口；没有 server 入口时也要说明未来 SSR 接入方式。直接使用 `src/` 的天然通用包或单端专用包，必须说明不拆分原因、runtime 归属和 exports 约束。
- 每个 monorepo 必须说明质量工具链继承关系：根配置、app/package 扩展点、聚合 check、单 app/package 验证命令。
- 若加入 Turbo，必须说明至少命中了两个建议引入信号；若不加入，也要说明当前使用 pnpm workspace/filter 足够的原因。
- 电商平台推荐规范如果被采用，必须标记采用项；未采用时不得作为缺口强制阻塞交付。
- 每次把 app-local 代码上移到 `packages/*` 前，必须说明复用证据、兼容风险、受影响 app 和回归验证范围。
- 交付说明必须包含 workspace 命令地图，例如 root check、单 app dev/mock/build、单 package typecheck。
- 已有 monorepo 若不符合本规范，应标记为 `compatible-exception` 或提出迁移计划，不得静默重排目录。
