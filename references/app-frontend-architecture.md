# App Frontend Architecture Placeholder

## Scope

本文件是 `product-to-dev-skill` 的 App lane 占位入口，用于在产品需求分流时识别 iOS/Android App、React Native、Expo、原生能力、离线能力、推送、深链、相机、定位、支付、App Store / Play Store 交付等移动端范围。

当前文件不是完整 App 开发规范，也不是脚手架说明。App 规范仍在整理中时，本 lane 只用于：

- 在前端规范路由中把 App 需求从 Web SPA / Web SSR 中分出来。
- 在 handoff 中记录 App 端能力、平台、原生依赖、接口、权限、离线/缓存、发布与验证缺口。
- 防止 Web SPA 或 SSR 规则被误用于移动端 App。
- 为后续 `references/app-*.md`、`assets/app/` 模板和示例预留稳定入口。

## Current Status

- 状态：placeholder。
- 允许：需求识别、route/lane 归类、范围说明、风险和后续规范 TODO。
- 不允许：声称已按 App lane 完成交付、默认创建 React Native / Expo 项目、默认生成 App 代码、默认复用 Web SPA/SSR 模板。
- 若用户明确要求立即实现 App，必须先确认目标技术栈和现有项目约定；有既有 React Native / Expo 项目时按项目规范执行，并按需使用当前会话可用的 React Native / Expo companion skills。

## Routing Signals

命中以下信号时，应优先归入 App lane，而不是 SPA 或 SSR lane：

- 目标端包含 iOS、Android、App、移动客户端、原生 App、React Native、Expo、Flutter 或小程序外壳。
- 需求包含 App Store / Play Store、EAS Build、TestFlight、APK/AAB、OTA、推送通知、deep link、Universal Links、App Links。
- 需求包含相机、相册、扫码、定位、蓝牙、NFC、生物识别、系统分享、通讯录、文件系统、后台任务或设备权限。
- 需求包含离线优先、本地数据库、弱网同步、冲突解决、移动端缓存、App 启动性能或包体体积。
- 需求包含移动端导航栈、底部 tab、原生手势、安全区、键盘避让、状态栏、Haptics 或平台差异。

## Placeholder Boundaries

- App lane 不能直接使用 `assets/react-tailwind-template/`。
- App lane 不能直接使用 `assets/ssr/` 模板。
- Web SPA 的 APIClient、MUI、Tailwind、DOM 布局和浏览器交互规则不能直接套到 App。
- Web SSR 的 RSC、Route Handler、Server Action、metadata、sitemap、Open Graph 和 BFF cache 规则不能直接套到 App。
- 通用契约规则仍然适用：OpenAPI/Prism mock、DTO/API 文档/SQL 语义一致、统一响应 wrapper、鉴权边界、i18n、quality tooling、TypeScript 命名和 comment 规则。
- App 特有网络、存储、安全、权限、发布和真机验证规则待后续 App references 补齐。

## Future Reference Map

后续 App 规范稳定后，建议拆成以下文件：

- `references/app-delivery-workflow.md`：App 需求 intake、平台矩阵、交付步骤和 handoff。
- `references/app-frontend-architecture.md`：Expo / React Native 架构、目录、导航、状态、服务层和平台边界。
- `references/app-data-and-offline.md`：API、缓存、本地存储、离线队列、同步、冲突和弱网策略。
- `references/app-native-capabilities.md`：权限、相机、定位、通知、深链、支付、文件和原生模块。
- `references/app-ui-runtime.md`：导航、组件、手势、动画、安全区、键盘、平台差异和可访问性。
- `references/app-security-and-release.md`：token 存储、证书、隐私权限、日志脱敏、EAS/TestFlight/Play Store 发布。
- `references/app-verification.md`：Expo Go、dev client、模拟器、真机、离线/弱网、权限、发布包和回归验证。

## Handoff Requirements During Placeholder Phase

当需求命中 App lane 但规范尚未补齐时，交付说明必须包含：

- App lane 当前是 placeholder，未按完整 App 规范实现。
- 目标平台：iOS、Android、双端或待确认。
- 技术栈假设：React Native、Expo、既有原生项目或待确认。
- 需要的原生能力、权限、离线/缓存、推送、深链、发布和真机验证范围。
- 可复用的通用契约、mock、API、SQL、i18n、quality tooling 和文档规则。
- 不能复用或尚未定义的 Web SPA/SSR 规则。
- 后续应补齐的 App references、assets、脚手架或模板清单。
