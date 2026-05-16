import { CssBaseline, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { appTheme } from './theme';
import { i18n } from '@/locale/i18n';
import { FeedbackProvider } from '@/shared/feedback/FeedbackProvider';

/*
 * 应用 Provider 参数，用于统一包裹根应用节点。
 */
export interface IAppProvidersProps {
  /*
   * 被全局主题、国际化和反馈能力包裹的页面内容。
   */
  children: ReactNode;
}

/*
 * 统一装配 MUI 主题、基础样式、国际化和全局 Snackbar 能力。
 */
export function AppProviders({ children }: IAppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <FeedbackProvider>{children}</FeedbackProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
