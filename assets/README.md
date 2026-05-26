# Skill Assets

`assets` 用于存放主入口按 SPA/SSR/App route 分流后需要复用的示例、模板、脚手架片段和检查清单。

当前约定：

- SSR 示例统一放 `assets/ssr/examples/`。
- SSR 模板统一放 `assets/ssr/templates/`。
- App 端资产入口先放 `assets/app/`，当前仅作为 placeholder；App 规范补齐前不提供可复制 App 模板或示例。
- 不在 reference 文件中内嵌大型示例或模板；reference 只提供路由、规则和归属，示例沉淀在本目录。
- SSR、SPA 与 App 共用资产在主入口路由稳定后统一整理命名、目录和复用方式。
