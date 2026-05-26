# SSR Contracts And Mock

## Contract Source Of Truth

- 每个前端消费的数据能力必须有 endpoint id、method、path、operationId、request DTO、response DTO、错误码、鉴权和缓存策略。
- OpenAPI/Prism mock 是 mock runtime 的事实来源；服务、hook、Server Component、Route Handler 和 Server Action 不写死 mock 成功响应。
- API 文档、OpenAPI schema、Prism example、DTO、BFF adapter、SQL 语义和页面 view model 必须保持字段、枚举、必填/可选和错误语义一致。
- 后端暂缺时，契约可以标注 `backend-gap`，但 mock 默认成功 example 仍要能支撑业务验收。

## DTO Placement

- 项目内复用的 DTO、endpoint id、error code 放目标项目约定的契约目录；本 SSR 规则不规定跨应用包结构。
- 单 app 私有 DTO 可以放 `src/bff/dto` 或 `src/types/dto`，但不得在页面组件中直接消费后端 raw DTO。
- TypeScript interface 使用 `I` 前缀，type alias 使用 `T` 前缀。
- API-facing DTO 字段必须有业务含义注释，说明单位、格式、枚举值、可选条件和兼容语义。

## OpenAPI Rules

- 每个已实现 frontend service/BFF method 必须能映射到 OpenAPI path 和 operationId。
- 前端消费对象不能用宽泛 `type: object` + `additionalProperties: true` 逃避字段治理；只有明确 extension bag 才允许。
- request/response example 必须可被 Prism 返回，并与 BFF parser、adapter、UI 空态/错误态兼容。
- 统一响应 wrapper 必须按项目约定严格校验；SSR 服务端调用不能绕过 wrapper。
- 错误响应至少覆盖鉴权失败、权限不足、校验失败、业务失败和服务异常。

## Prism Runtime Rules

- mock/dev/test/prod 的 baseUrl 通过环境配置进入 gateway，不在组件或 service 中写死。
- Prism mock smoke 至少覆盖关键公开 GET、登录态 GET、mutation 成功、鉴权失败、业务错误和 malformed wrapper 防线。
- OpenAPI example 中的展示文案若会被 UI 直接展示，必须来自 locale 字典、后端 i18n 契约或明确的 mock 文案来源。
- mock 数据可以使用 fixture 生成 OpenAPI examples，但运行时请求必须到 Prism。

## Adapter Rules

- adapter 输入后端 DTO，输出前端稳定 view model。
- adapter 是字段兼容、枚举归一、缺省值、旧接口兼容和展示模型稳定的唯一位置。
- adapter 不读 cookies、headers、环境变量，不发 HTTP 请求，不做权限判断，不触发 revalidation。
- 旧接口迁移时，adapter 必须保留页面依赖的旧响应语义，除非用户明确批准 UI/API 变更。

## API Documentation Linkage

- 每个模块 API 文档必须标注 endpoint id、OpenAPI path、operationId、鉴权、缓存、DTO、错误码、mock 状态和后端实现状态。
- 文档中标 `Implemented` 的 endpoint 必须存在 OpenAPI path 和 Prism example。
- 文档中标 `Planned`、`Backend gap`、`Not available in mock` 的 endpoint 不得被前端默认运行路径调用为成功。
- 变更契约时同步更新 API 文档、OpenAPI、DTO、adapter、mock smoke 和相关测试。
