# Next App Router MUI Provider Example

本示例是 SSR 项目接入 MUI 的最小形态，用于生成或审查新项目时对齐 provider、Emotion cache、CSS layer 和 RSC 边界。示例默认 Next App Router，实际版本路径按项目 Next 主版本调整，例如 `v15-appRouter` 或目标版本对应路径。

## Dependencies

```bash
pnpm add @mui/material @emotion/react @emotion/styled @mui/material-nextjs
```

只有图标规模足够大且项目确认收益时才额外加入：

```bash
pnpm add @mui/icons-material
```

## File Layout

```text
src/
  app/
    layout.tsx
    providers.tsx
    globals.css
  shared/
    ui/
      theme.ts
```

## `src/shared/ui/theme.ts`

```ts
import { createTheme } from '@mui/material/styles';

/**
 * SSR 共享主题只定义稳定 token，不读取 cookies、headers 或浏览器状态。
 */
export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: true,
    dark: true,
  },
  shape: {
    borderRadius: 8,
  },
});
```

## `src/app/providers.tsx`

```tsx
'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { theme } from '@/shared/ui/theme';

/**
 * 只承载浏览器安全 provider；服务端数据、鉴权和缓存策略留在 app/bff 边界。
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

## `src/app/layout.tsx`

```tsx
import type { ReactNode } from 'react';

import { AppProviders } from './providers';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

## `src/app/globals.css`

```css
@import "tailwindcss";

@layer theme, base, mui, components, utilities;

@theme {
  --radius-app: 8px;
}
```

## Review Checklist

- `AppRouterCacheProvider` 的 import 路径匹配项目 Next 主版本。
- `ThemeProvider` 只在统一 provider 入口挂载一次。
- Provider 不读取 server env、cookies、headers、BFF gateway 或 Node API。
- SEO 正文、metadata、缓存判断和服务端数据读取没有被整页 MUI Client Component 接管。
- MUI 与 Tailwind 共存时有 CSS layer 策略，截图无 FOUC、暗色模式闪烁和 hydration warning。
