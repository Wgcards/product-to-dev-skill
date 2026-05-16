import { useState } from 'react';
import { runItemAction as requestItemAction } from '@/features/sample/service/sampleService';
import type { IApiResponse } from '@/types/dto/api';
import type { ISampleItem } from '@/features/sample/types/sample';

/*
 * 事项流转 hook 返回值，封装动作请求和当前动作态。
 */
export interface IUseItemActionResult {
  /*
   * 当前正在流转的事项 ID。
   */
  actioningId: string | null;
  /*
   * 发起事项状态流转请求。
   */
  runItemAction: (
    itemId: string,
    operatorNote: string,
  ) => Promise<IApiResponse<ISampleItem | null>>;
}

/*
 * 流转事项状态，只负责状态流转动作和按钮 loading 状态。
 */
export function useItemAction(): IUseItemActionResult {
  const [actioningId, setActioningId] = useState<string | null>(null);

  /*
   * 流转请求完成后始终清空动作态，避免按钮长期禁用。
   */
  async function runItemAction(
    itemId: string,
    operatorNote: string,
  ): Promise<IApiResponse<ISampleItem | null>> {
    setActioningId(itemId);

    try {
      return await requestItemAction(itemId, operatorNote);
    } finally {
      setActioningId(null);
    }
  }

  return {
    actioningId,
    runItemAction,
  };
}
