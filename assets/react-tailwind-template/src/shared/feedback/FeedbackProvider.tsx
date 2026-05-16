import { Alert, Snackbar } from '@mui/material';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { FeedbackContext } from './FeedbackContext';
import type { IFeedbackContextValue, IFeedbackPayload } from './FeedbackContext';

/*
 * Provider 参数，承载应用主体内容。
 */
export interface IFeedbackProviderProps {
  /*
   * 需要共享反馈能力的 React 子树。
   */
  children: ReactNode;
}

/*
 * 提供全局 Snackbar + Alert，避免业务组件重复实现提示状态。
 */
export function FeedbackProvider({ children }: IFeedbackProviderProps) {
  const [payload, setPayload] = useState<IFeedbackPayload | null>(null);

  const contextValue = useMemo<IFeedbackContextValue>(
    () => ({
      showFeedback(nextPayload) {
        setPayload(nextPayload);
      },
    }),
    [],
  );

  /*
   * 关闭 Snackbar 时清空当前消息，下一条消息可立即重新触发动画。
   */
  function closeFeedback() {
    setPayload(null);
  }

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={Boolean(payload)}
        autoHideDuration={3600}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={closeFeedback}
      >
        <Alert severity={payload?.severity ?? 'info'} variant="filled" onClose={closeFeedback}>
          {payload?.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}
