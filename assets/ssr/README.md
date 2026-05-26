# SSR Asset Routing

SSR 相关示例和模板先集中放在本目录下，避免散落到各 reference。

- `examples/`：页面分型、BFF 链路、日志、配置、安全、i18n 等示例。
- `templates/`：可复制的项目片段、目录骨架、handoff 模板和验证清单。

已沉淀示例：

- `examples/next-app-router-mui-provider.md`：Next App Router + MUI + Emotion cache provider + CSS layer 最小示例。
- `examples/bff-read-route-handler.md`：Server Component 读链路与 Route Handler HTTP 边界复用同一 BFF service 的示例。
- `examples/server-action-with-bff.md`：Server Action 经过 BFF action/service/gateway 完成 UI mutation 的示例。

已沉淀模板：

- `templates/next-app-router-bff-skeleton.md`：Next App Router SSR/BFF 目录骨架、gateway、service、adapter、page 与 handoff 模板。
- `templates/server-action-mutation.md`：内部 UI mutation 的 Server Action 模板，覆盖输入校验、BFF 调用、返回结构和 revalidation。
- `templates/ssr-common-pitfalls-checklist.md`：SSR/BFF 高频踩坑自检清单。
