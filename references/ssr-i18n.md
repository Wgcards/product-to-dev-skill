# SSR I18n

## Goals

- SSR / BFF 项目使用 `next-intl` 作为语言文案、formatter 和语言上下文的默认方案。
- 新 SSR 项目不使用 locale 路由，不通过 `/zh-CN/**`、`/en-US/**`、`app/[locale]/**` 或 locale route group 实现语言切换。
- 语言切换只改变当前会话/用户的 locale 上下文，并刷新当前页面相关接口；不得用整页 URL 跳转替代数据刷新。

## Locale Routing Policy

- 新 SSR 项目禁止新增 locale path segment，例如 `app/[locale]/page.tsx`、`/(en)`、`/(zh-CN)` 或按语言复制路由树。
- 既有项目已经使用 locale 路由时，不在当前 SSR 通用规范中自动迁移；需要单独 migration 方案和用户确认。
- SEO 公开页面需要多语言 URL 时，当前规范不默认支持；先按无 locale 路由交付，并在 handoff 中标注 SEO 多语言 URL 缺口。
- `metadata.alternates.languages` / hreflang 只有在项目明确有稳定多语言 URL 策略时才输出；否则不要伪造 locale URL。

## Locale Source

- locale 来源按优先级声明：用户设置、同源 cookie、浏览器 header、项目默认语言。
- BFF 读取 locale 后透传给后端或 Prism，例如 `Accept-Language` 或项目等价 header。
- Server Component、metadata、Route Handler、Server Action、gateway 和 logger 使用同一个 request locale context。
- locale、currency、tenant、permission 等会影响数据和展示的上下文必须进入 cache key、tag 或 no-store 决策。

## Language Switch Flow

语言切换必须按当前页面局部刷新处理：

1. 用户在 Client Component 中选择语言。
2. 通过 `next-intl` / 项目 locale action 更新当前 locale preference，例如 cookie、用户设置或内存状态。
3. 进入 pending/loading 状态，禁用重复点击，并保持当前 URL path 不变。
4. 刷新当前页面相关服务端数据：优先使用 `router.refresh()` 刷新 Server Component 与 BFF read 数据。
5. 刷新当前页面相关客户端 GET：使用 SWR `mutate`、React Query `invalidateQueries` / `refetchQueries` 或项目请求 hook，只刷新当前页面 scope 的 key。
6. 切换完成后恢复交互；失败时回滚语言选择或展示 locale-backed 错误提示。

禁止：

- 通过跳转到 locale path 完成语言切换。
- 用 `window.location.reload()` 或强制整页刷新替代当前页面接口刷新。
- 切换语言后无条件刷新全站 query/cache。
- 只切换 UI 字典但不刷新依赖 locale 的 BFF/后端数据。

## Loading And UX

- 语言切换按钮必须有 pending 状态；切换期间防重复提交。
- 当前页面依赖 locale 的数据岛必须有局部 loading、skeleton、disabled 或 optimistic stale state 策略。
- `router.refresh()` 期间可以保留旧页面内容，但必须给用户明确的切换中反馈。
- 客户端列表、筛选、分页、价格、币种、状态文案和错误文案刷新时不能造成布局跳动或控件重置，除非业务明确要求。

## Messages And Copy

- 用户可见文案必须来自 `next-intl` messages、后端 i18n 契约或 locale-aware mock 来源。
- metadata、OG、错误页、not-found、unauthorized、forbidden、loading/empty/error 状态都必须读取当前 locale。
- OpenAPI example 中会被 UI 直接展示的文案必须说明 locale 来源；mock 不能只内置单语言文案后假装多语言完成。
- locale key 命名按业务模块组织，避免全局 message 文件变成无边界公共池。

## BFF And Cache

- BFF service input 必须包含 locale，或从 request context 安全读取；adapter 不自行读取 cookie/header。
- gateway 出站请求应透传 locale header；后端返回 locale-aware `codeMsg` 时可作为契约展示。
- 公开可缓存页面若内容受 locale 影响，cache tag/key 必须包含 locale；未做隔离时使用 dynamic/no-store。
- 语言切换后的 revalidation 只影响当前 locale 和当前页面相关业务对象，不做全站刷新。

## Verification

- 验证语言切换后 URL path 不变化，不出现 locale route 跳转。
- 验证 `router.refresh()` 或项目等价刷新被触发，当前页面相关 BFF/客户端 GET 按 locale 重新请求。
- 验证 pending/loading 状态、防重复点击、失败回滚或错误提示。
- 验证 metadata、错误页、空态、mock example、BFF header 和 cache key/tag 使用当前 locale。
- 交付说明必须列出 locale 来源、next-intl 接入点、语言切换刷新范围、loading 策略、cache locale 隔离和未覆盖的多语言 SEO 风险。
