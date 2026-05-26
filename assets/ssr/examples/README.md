# SSR Examples

SSR 示例统一放在这里。示例用于承载可复制片段，reference 只保留规则和决策。

- `next-app-router-mui-provider.md`：Next App Router + MUI provider 最小接入示例，覆盖 `AppRouterCacheProvider`、ThemeProvider、CSS layer 和 RSC 边界。
- `bff-read-route-handler.md`：展示 Server Component 内部读链路不自调 `/api/**`，Route Handler 只作为公开 HTTP 边界复用 BFF route facade。
- `server-action-with-bff.md`：展示内部 UI mutation 通过 Server Action、BFF action facade、service 和 gateway 完成提交与 revalidation。
