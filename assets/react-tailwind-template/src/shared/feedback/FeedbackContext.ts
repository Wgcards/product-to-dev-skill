import { createContext, useContext } from 'react';

/*
 * 全局反馈等级，对应 MUI Alert 的标准语义。
 */
export type TFeedbackSeverity = 'success' | 'info' | 'warning' | 'error';

/*
 * 展示 Snackbar 时需要传入的消息和语义。
 */
export interface IFeedbackPayload {
  /*
   * 需要展示给用户的业务提示文案。
   */
  message: string;
  /*
   * 提示语义，默认按普通信息处理。
   */
  severity?: TFeedbackSeverity;
}

/*
 * 全局反馈上下文能力，业务组件通过 hook 调用。
 */
export interface IFeedbackContextValue {
  /*
   * 展示一条 top-center Snackbar。
   */
  showFeedback: (payload: IFeedbackPayload) => void;
}

export const FeedbackContext = createContext<IFeedbackContextValue | null>(null);

/*
 * 获取全局反馈能力；必须在 AppProviders 子树内调用。
 */
export function useFeedback(): IFeedbackContextValue {
  const contextValue = useContext(FeedbackContext);

  if (!contextValue) {
    throw new Error('useFeedback must be used within FeedbackProvider.');
  }

  return contextValue;
}
