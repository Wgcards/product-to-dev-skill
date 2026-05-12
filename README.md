---
name: product-to-dev-skill
description: 当业务人员或产品人员使用自然语言描述业务需求、页面交互、数据模型、系统设计或前后端方案时使用。该 skill 用于生成可部署的 React 前端工程、前端 mock 假数据对接、按业务模块拆分且可供后续 AI 直接开发的 Java 后端开发文档、REST 风格 HTTP 接口文档和 MySQL SQL 文件；后端只生成开发文档和接口文档，不直接生成 Java 实现代码。
---

# Product-to-Dev Skill README

本文是 `product-to-dev-skill` 的中文主规范，用于同步当前完整 skill 的执行目标、交付范围、目录约定、前端 mock 规范、Java 后端文档规范、API 文档规范、MySQL DDL 规范、验证交付规范和引用资料地图。

## 目标

将业务人员、产品人员用自然语言描述的业务需求、页面想法、流程规则、字段模型和系统设计，转化为一套可演示、可评审、可运行、可交接给后续研发的交付物。

默认交付物包括：

1. React 前端工程，包含真实交互、mock 数据对接和可构建产物。
2. 前端 mock service，数据结构必须和 API 文档一致。
3. 按业务模块拆分的 Java 后端开发文档，不生成 Java 源码。
4. 按业务模块拆分的 REST 风格 HTTP API 文档。
5. 符合 GX 表规范的 MySQL DDL SQL 文件。
6. 面向业务、产品、前端、后端、测试和后续 AI 开发的交接说明。

内置 `assets/react-tailwind-template/` 和 `scripts/create_react_app.py` 是从早期业务 React 应用构建器继承而来的前端子模块，可用于新建 Vite React TypeScript Tailwind v4 工程。

## 使用边界

1. 当用户描述业务需求、产品流程、页面交互、字段模型、后端方案、接口设计或数据库设计时，默认使用本 skill。
2. 用户未明确缩小范围时，按完整交付处理：前端代码、mock 数据和 service、Java 后端开发文档、REST API 文档、MySQL SQL、验证说明、交接说明都要产出。
3. 只有用户明确说“先出方案”“只写文档”“只要接口”“只要 SQL”“不要前端”“不要代码”等，才按局部交付执行，并说明哪些完整交付项被有意跳过。
4. 已有项目必须先检查仓库结构，遵守既有框架、路由、请求封装、mock、样式、认证、菜单、权限和目录约定。
5. 新建前端工程优先使用 `python3 scripts/create_react_app.py <target-dir> --name "<display name>"` 脚手架。
6. 后端目标语言是 Java/Spring 企业栈，但本 skill 不创建 Controller、Service、Mapper、Entity、Mapper XML 或 Java 实现代码，除非用户显式改变约束。

## 总体工作流

### 1. 需求分类

1. 判断是已有项目增强、新前端应用、纯文档/API/SQL 交付，还是完整业务需求交付。
2. 对已有项目，先阅读本地代码，识别框架、菜单、路由、认证、请求、mock、样式、组件库和命名习惯。
3. 对模糊、多角色、多部门协作或产品化需求，优先阅读 `references/intake-and-delivery.md`。
4. 不把业务口语直接当 UI 文案；要改写成简洁、稳定、可操作的标签、状态、筛选项、按钮、错误提示和字段名。

### 2. 构建交付范围

1. 先按业务模块拆分，再拆分每个模块的前端行为、后端能力、API 契约、SQL 表、mock 数据和交接说明。
2. 优先补齐产品化假设，不因非阻塞信息缺失而停住。
3. 只询问会影响架构、核心数据模型、关键状态流转或不可逆业务决策的阻塞问题。
4. 在最终交付中列出关键假设和后续可调整点。
5. 每个模块都要有明确的对象、角色、流程、状态、异常、权限、审计和下一步动作。

### 3. 更新或生成 React 前端

1. 修改前端架构前阅读 `references/frontend-react.md`。
2. 增加 service、mock 数据或真实 API 切换点前阅读 `references/mock-and-integration.md`。
3. 前端 UI、UE、UX 设计优先使用 companion skill `ui-ux-pro-max`，用于检索产品类型、风格、字体、配色、图表、UX 和技术栈最佳实践。
4. 如果 `ui-ux-pro-max` 当前会话不可用，继续使用 `references/design-direction.md`、`references/tailwind-v4-system.md` 和 `references/react-performance.md` 兜底，并在交接说明里提示用户按标准 skill 安装流程安装 UI UX Pro MAX；除非用户主动询问，不在本 skill 中展开安装步骤。
5. 涉及视觉方向、Tailwind token 或性能风险时，按需阅读 `references/design-direction.md`、`references/tailwind-v4-system.md`、`references/react-performance.md`。
6. 页面必须能真实交互，不只做静态 UI；至少覆盖列表、筛选、创建或编辑、详情、状态操作、确认反馈、错误提示、空状态和加载状态。
7. 前端数据必须从 service/mock 层取得，页面和组件不得硬编码业务记录。
8. mock 假数据默认集中放在 `src/mocks/mock-data.ts`，如果项目已有单一 mock 数据约定则服从项目约定。
9. mock 或 API service 默认放在 `src/services/`，真实接口切换点集中在 service 层。
10. 新建公共 TypeScript 类型放在 `src/types/`，新增接口优先使用 `I` 前缀，新增 type alias 使用 `T` 前缀。
11. hand-written 函数、组件、复杂分支、mock 替换点和重要 TSX 结构可添加简洁中文注释，但只在能帮助后续维护时添加。
12. 不引入新依赖，除非它明显降低复杂度或匹配现有项目技术栈。

### 4. 生成后端和 API 文档

1. 创建或重组后端/API 文档前阅读 `references/module-documentation.md`。
2. Java 后端开发文档参考 `references/backend-java-docs.md`。
3. 写后端模块方案、缓存、MQ、事务一致性、性能、观测性或中间件选择前阅读 `references/backend-architecture.md`。
4. REST API 文档参考 `references/api-contracts.md`。
5. 每个业务模块默认生成一个后端开发文档和一个 API 文档，除非目标项目有更强约定。
6. 后端文档要写到开发建议可执行粒度，包括业务规则、状态流转、校验、事务边界、幂等、并发控制、锁、降级、异常、日志、审计、指标、链路追踪、告警、缓存 key、TTL、MQ topic、事件、定时任务和外部系统集成。
7. 每个模块、service 方法和 endpoint 必须标注使用的表、读写目的和 SQL 文件路径。
8. 后端设计保持主流 Java/Spring 企业实践，除非已有项目约定另有要求。
9. 生成的后端/API/SQL 是推荐实现基线，后续编码 skill 可结合真实项目上下文调整，但应记录调整原因。
10. 后端文档应包含下游 skill handoff：阅读顺序、建议实现归属、建议实现顺序、风险点、取舍理由和可调整点。
11. 缓存、MQ、分布式锁、定时任务、外部适配器、对象存储、搜索索引、限流、熔断和降级等后端方案使用建议等级表达：`S1`、`S2`、`S3`、`N/A`。

### 5. 生成数据库 SQL

1. 写或修改 DDL 前阅读 `references/database-mysql.md`。
2. 所有 DDL 必须落到 SQL 文件，不只在对话中说明。
3. 默认一模块一个 SQL 文件，除非目标项目已有更强规范。
4. 用户已给出表模型时，优先尊重用户设计；如存在明显风险，先说明风险，再给兼容调整建议。
5. 可以补充必要唯一约束、索引、状态字段、审计字段和注释，但必须在交接说明中说明补充原因。
6. 不默认生成 `DROP TABLE`、物理删除数据或破坏性重置 SQL；已有表优先给 `ALTER TABLE`，新表给 `CREATE TABLE`。

### 6. 验证与交接

1. 最终回复前阅读 `references/delivery-verification.md`。
2. 先跑最小必要检查，再在路由、共享配置、构建契约或用户流程变更时扩大检查范围。
3. 前端改动完成后，在环境支持时必须浏览器打开或截图检查。
4. 验证项至少考虑类型检查、构建、关键页面可访问、核心交互可操作、mock 数据返回正常、字段与 API/SQL 一致。
5. 交接说明要列出运行命令、关键路径、mock 替换真实接口步骤、文档路径、SQL 路径、验证结果、假设和后续建议。

## 默认产物目录

1. 前端工程：`frontend/`、`web/` 或用户指定目录。
2. 后端开发文档：`docs/backend/<module-name>.md`；多模块时可增加 `docs/backend/index.md`。
3. HTTP API 文档：`docs/api/<module-name>.md`；多模块时可增加 `docs/api/index.md`。
4. SQL 文件：`sql/<module-name>.sql`。
5. mock 数据：前端 `src/mocks/mock-data.ts`，除非已有项目另有单一 mock 数据约定。
6. mock 或 API service：前端 `src/services/` 或既有 service 目录。
7. 真实 API 切换辅助：使用内置模板时放在 `src/services/api-client.ts`。
8. 共享 TypeScript DTO/VO 类型：`src/types/`。
9. 交接说明：优先使用 `docs/handoff.md` 或项目既有交接文档路径。

## 核心规则

1. 以模块为先，不把多个无关业务域混在同一个后端文档或 API 文档中。
2. 默认完整交付，除非用户明确要求局部交付。
3. 前端 mock、TypeScript 类型、API 文档和 SQL 语义必须保持一致。
4. 统一 API 响应外层结构为 `{ data, code, codeMsg }`。
5. `code === "200"` 时前端读取 `data`；`code !== "200"` 时直接展示 `codeMsg`。
6. 鉴权使用请求头 `authorization: <backend-token>`，前后端生成契约禁止使用 cookie。
7. Controller 和 service 返参禁止直接返回 `Map`；有明确业务语义的返回结构必须定义 DTO/entity。
8. 列表接口必须明确分页参数、排序规则、筛选条件和分页返回结构。
9. 状态变更接口必须明确前置状态、目标状态、异常状态和幂等行为。
10. 业务上具有唯一性的字段必须有数据库唯一约束，不能只依赖应用层校验。
11. 不生成无关模板文档、空目录或不可使用的占位文件。
12. 不在前端暴露真实密钥、生产 token、数据库连接或生产私有接口地址。

## 前端开发规范

1. 新建前端工程优先使用 Vite + React + TypeScript + Tailwind v4。
2. 目标项目已有技术栈时，必须服从目标项目。
3. UI、UE、UX 设计优先使用 `ui-ux-pro-max`；用户只需要调用 `$product-to-dev-skill`，不用额外选择两个 skill。
4. `ui-ux-pro-max` 不可用时，使用本 skill 的内置设计参考兜底，并提示用户按标准 skill 安装流程安装 UI UX Pro MAX。
5. 路由、页面、组件、service、mock、types、utils 职责清晰，避免把所有逻辑写在单个组件中。
6. 表单必须包含必要校验，例如必填、长度、金额、手机号、邮箱、枚举值和时间范围。
7. 列表页必须包含加载态、空状态、错误态、分页态；危险操作必须有二次确认。
8. 状态字段要集中维护枚举映射，避免多个组件重复硬编码状态文案。
9. 金额、日期、状态、枚举、文件等展示格式要统一封装或集中处理。
10. UI 应清晰、专业、可演示；SaaS、CRM、运营后台等工具型系统应偏安静、克制、信息密集、易扫描。
11. 不做无意义 landing page；用户要的是站点、应用、工具或游戏时，第一屏应是可用产品体验。
12. 使用图标按钮时优先使用项目已有图标库或 lucide；不要用手写 SVG 替代成熟图标。
13. 所有可点击元素应有清晰 hover/focus 状态和 pointer 反馈。
14. 文本不能溢出、遮挡或在移动端造成横向滚动。
15. 验证时优先运行项目已有命令，例如 `npm install`、`npm run typecheck`、`npm run build`、`npm run lint`、`npm run dev`。
16. 如果无法验证，最终说明必须写清楚未验证项和原因。

## Mock 与真实接口切换规范

1. mock 数据覆盖正常、空数据、异常、边界状态和状态流转后的结果。
2. mock service 可以拆分多个方法，但只能从统一 mock 数据文件读取和更新假数据。
3. mock 层尽量模拟真实接口延迟、错误码、分页和状态流转。
4. 页面组件禁止直接访问 mock 数据文件；必须通过 service 方法。
5. service 层每个 mock 方法旁保留真实接口替换注释，建议格式：

```ts
/*
 * TODO backend: POST /api/example - replace mock after Java API is ready.
 */
```

6. 提供 `VITE_API_BASE_URL` 等配置点，方便从 mock 切换到真实 HTTP API。
7. 真实接口接入步骤必须写入 README 或交接说明。

## Java 后端开发文档规范

1. 文档必须是开发人员可执行的粒度，不只写概念。
2. 推荐结构包括：模块元信息、模块职责、表使用说明、包结构建议、领域模型和 DTO、业务规则、核心流程、状态机、service 方法设计、数据访问设计、中间件建议矩阵、缓存设计、MQ/任务/外部系统、校验与权限、事务/幂等/并发、性能容量、异常错误码、日志审计指标追踪告警、可追溯矩阵、下游 skill handoff、假设和未决问题。
3. Service 方法设计要写清方法名、职责、入参、出参、校验、事务、锁、幂等键、异常、事件和观测点。
4. 涉及异步任务、MQ、定时任务或外部接口时，要说明触发时机、请求响应、重试、幂等、补偿和降级。
5. 涉及权限、登录态、租户、商户、组织或数据隔离时，要明确后端校验点。
6. 中间件、缓存、MQ、定时任务、锁、外部适配器、对象存储、搜索索引、限流、熔断和降级使用建议等级：
   - `S1`：强烈建议，影响正确性、一致性、安全或集成兼容。
   - `S2`：主流推荐方案，项目没有更强约定时优先采用。
   - `S3`：可选优化或后续增强。
   - `N/A`：当前模块不建议使用，并说明原因。
7. 缓存建议应包含 cache ID、key pattern、value shape、TTL、读策略、失效/刷新时机、一致性、缓存穿透/击穿/雪崩处理和 Redis 不可用时的 fallback。
8. MQ/事件建议应包含 event ID、topic/queue、producer、consumer、payload、发送时机、投递语义、消费者幂等、重试、死信和补偿。
9. 定时任务建议应包含 job 名称、触发条件、调度周期、分片/锁、查询窗口、批量大小、幂等、重试和人工补偿入口。
10. 性能容量建议应包含数据量假设、热点查询、推荐索引、分页上限、批处理大小、缓存命中目标、MQ 吞吐和慢查询风险。
11. 可观测性建议应包含结构化日志、关键业务 ID、错误码、请求耗时、MQ lag、重试次数、缓存命中率、链路追踪 span 和告警点。
12. 下游编码 skill 可按推荐方案实现，也可在真实项目约束下调整，但需要记录理由。

## API 文档规范

1. API 文档必须覆盖前端 mock 中使用的全部接口。
2. 接口设计采用 REST 风格 HTTP API，围绕资源命名，用 HTTP 方法表达动作。
3. 每个接口必须包含接口名称、业务说明、HTTP 方法、路径、请求头、请求参数、校验规则、响应字段、状态流转、错误码、示例请求和示例响应。
4. 文档必须说明统一响应结构、分页结构、错误码结构和鉴权方式。
5. 字段命名要和前端 TypeScript 类型、mock 数据、SQL 字段语义一致。
6. 每个接口都要写表影响摘要，标注读表、写表和用途。
7. 状态变更接口要写允许前置状态、成功后目标状态、重复提交处理和冲突错误。
8. 涉及缓存时写明读取、失效、刷新或绕过缓存的建议。
9. 涉及异步处理时写明事件 ID、topic、发送时机、payload 摘要和消费者幂等建议。

## MySQL DDL 规范

1. 使用 InnoDB 存储引擎，字符集统一使用 utf8mb4，排序规则按项目统一设置。
2. 表名、字段名使用小写字母、数字、下划线，采用 snake_case，禁止大写和数字开头。
3. 表名不使用复数名词，建议采用“业务名词_表作用”。
4. 禁止使用 MySQL 保留字作为表名或字段名。
5. 每张业务表必须有主键 `id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID'`。
6. 主键定义为 `PRIMARY KEY (`id`) USING BTREE`。
7. 每张业务表必须包含公共字段：`create_time`、`create_person`、`update_time`、`update_person`、逻辑删除字段。
8. 逻辑删除字段以用户提供的数据模型或目标项目既有约定为准，SQL、后端文档、API 文档、前端类型和 mock 数据必须保持同一个字段名。
9. 如果数据模型使用 `is_delete`，沿用 `is_delete`；如果使用 `is_deleted`，沿用 `is_deleted`；如果没有用户模型或项目约定，GX 默认使用 `is_delete tinyint unsigned NOT NULL DEFAULT '0' COMMENT '删除标记：0-未删除，1-已删除'`。同一项目禁止混用 `is_delete` 和 `is_deleted`。
10. `create_time` 和 `update_time` 全库类型统一使用 `timestamp`。
11. `create_person`、`update_person` 建议使用 `varchar(64) NOT NULL COMMENT '创建人/更新人'`。
12. 表和字段必须添加中文 COMMENT，状态字段 COMMENT 必须写清枚举值含义。
13. 表达“是/否”的字段必须使用 `is_xxx` 命名，类型使用 `tinyint unsigned`，1 表示是，0 表示否。
14. 非负数字段优先使用 unsigned，例如 id、数量、状态、类型、计数。
15. 禁止使用 enum 类型；小数使用 decimal，禁止 float 和 double。
16. 金额、余额、手续费常用 `decimal(16,4)`；汇率、比例按精度使用 `decimal(10,4)` 或 `decimal(16,4)`。
17. 字符串长度按实际含义设置，避免无脑 `varchar(255)`；编号常用 `varchar(32/64)`，名称常用 `varchar(64/100)`，备注常用 `varchar(255/500)`。
18. `varchar` 长度超过 5000 时应使用 text；大文本字段建议拆到独立扩展表。
19. 必填字段使用 `NOT NULL`；可选字段使用 `DEFAULT NULL`；不要用空字符串规避 NULL 设计。
20. 业务唯一字段必须建立唯一索引。
21. 索引命名规范：唯一索引 `uk_字段名`，普通索引 `idx_字段名`，主键索引使用 PRIMARY KEY。
22. 单表索引数量建议控制在 5 个以内，联合索引字段数量建议不超过 5 个。
23. 高频查询字段、业务编号、外部流水号、状态加时间、关联 ID 可以建索引。
24. 联合索引字段顺序遵循最左前缀原则，优先等值查询字段，再范围查询和排序字段。
25. 避免重复索引；低区分度字段不单独建索引，可放入联合索引。
26. 禁止使用数据库外键和级联，外键关系由应用层维护。
27. 禁止用触发器、存储过程承载业务逻辑。
28. 关联字段类型必须完全一致。
29. 超过三个表的复杂 join 应谨慎，必要时通过冗余字段、宽表、异步汇总表或应用层组装解决。
30. 字段可适当冗余以提升查询性能，但不应冗余频繁修改字段或超长文本字段。
31. 单表预计超过 500 万行或容量超过 2GB 时才考虑分库分表，不要过度设计。
32. `ALTER TABLE` 新增字段必须包含字段类型、默认值、是否可空、中文 COMMENT，必要时指定 AFTER 位置。
33. 默认不生成 `DROP TABLE`、物理删除数据或破坏性重置 SQL；除非用户明确要求重置。已有表变更优先使用 `ALTER TABLE`，新表使用 `CREATE TABLE`。
34. 输出 SQL 前自检：主键、公共字段、中文注释、表注释、字符集、索引数量、索引命名、唯一约束、金额精度、逻辑删除字段命名、是否使用外键、是否写入 SQL 文件。

## 验证清单

1. 前端工程能安装、启动、类型检查或构建。
2. 关键页面可访问，核心交互可操作。
3. mock 数据能覆盖关键业务流程和异常提示。
4. API 文档、TypeScript 类型、mock 字段、SQL 语义一致。
5. SQL 文件包含主键、公共字段、中文注释、表注释、索引和唯一约束。
6. 后端文档包含中间件建议矩阵，并用 `S1`、`S2`、`S3`、`N/A` 表达缓存、分布式锁、MQ/事件、定时任务、外部适配器、对象存储、搜索索引、限流、熔断和降级建议。
7. 缓存建议包含 key、value、TTL、失效策略、一致性和 Redis 不可用处理；MQ/事件建议包含 topic、producer、consumer、payload、发送时机、幂等、重试、死信和补偿。
8. 下游 skill handoff 包含阅读顺序、建议实现归属、依赖建议、建议实现顺序、验证建议、假设和未决问题。
9. 前端改动后尽量进行浏览器截图或手动检查。
10. 最终交付说明列出已生成内容、运行命令、文档位置、mock 文件位置、SQL 文件位置、验证结果、假设和后续对接建议。

## 资源地图

1. `scripts/create_react_app.py`：确定性复制内置 Vite React TypeScript Tailwind v4 模板。
2. `assets/react-tailwind-template/`：前端 starter，包含集中 mock 数据、mock/真实 API 切换辅助、service、types 和运营型 UI 组件。
3. `references/intake-and-delivery.md`：需求摄取、范围拆分、提问策略和产物规划。
4. `references/module-documentation.md`：模块拆分、AI 可读文档、可追溯矩阵和可实现文档规则。
5. `references/frontend-react.md`：前端工程、交互、类型、UI 和旧 React builder 子模块规则。
6. `references/mock-and-integration.md`：mock 数据、service 层、统一响应和真实 API 切换。
7. `references/backend-architecture.md`：主流 Java 后端方案、中间件、缓存、MQ、一致性、性能和可观测性基线。
8. `references/backend-java-docs.md`：Java 后端开发文档结构和深度要求。
9. `references/api-contracts.md`：REST HTTP API 文档规则和 endpoint 模板。
10. `references/database-mysql.md`：GX MySQL DDL 标准和 SQL 自检。
11. `references/delivery-verification.md`：验证、目录边界和最终回复检查清单。
12. `references/design-direction.md`：应用 UI 默认方向、品牌页、动效和视觉检查。
13. `references/tailwind-v4-system.md`：Tailwind v4 配置、token、组件和暗色模式规则。
14. `references/react-performance.md`：React 性能检查项。
15. Companion skill `ui-ux-pro-max`：前端 UI/UE/UX 设计增强 skill，用于辅助页面布局、组件、字体、配色、图表、UX 模式和前端技术栈建议；不可用时提示用户按标准 skill 安装流程安装。

## 执行边界

1. 不因需求不完整而停在问题列表，优先给出合理产品化假设。
2. 不把 mock 当作最终后端实现，必须标记 mock 仅用于前端交互演示。
3. 不直接生成 Java 业务实现代码。
4. 不新增平行 API 返回体系。
5. 不忽略用户提供的表模型设计；发现冲突时说明风险并给兼容方案。
6. 不静默缩小交付范围。
7. 不把后端/API 文档写成空泛概念说明，应让后续 AI 或 Java 开发人员能基于推荐方案开始实现。
8. 不把后端建议写成不可调整命令；后续开发 skill 可以结合项目上下文调整方案，但需要记录原因。
