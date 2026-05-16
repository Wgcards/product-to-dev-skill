import { useCallback, useEffect, useState } from 'react';
import { listItems } from '@/features/sample/service/sampleService';
import type { IItemQuery, ISampleItem } from '@/features/sample/types/sample';
import type { IPageResponse } from '@/types/dto/api';

/*
 * 事项列表请求 hook 返回值，保持 data/loading/error 的固定输出形态。
 */
export interface IUseItemsResult {
  /*
   * 事项分页数据。
   */
  data: IPageResponse<ISampleItem> | null;
  /*
   * 事项列表是否正在加载。
   */
  loading: boolean;
  /*
   * 事项列表错误文案。
   */
  error: string | null;
  /*
   * 使用当前查询条件重新拉取列表。
   */
  refetch: () => Promise<void>;
}

/*
 * 拉取事项列表，只负责查询条件对应的列表请求和请求态。
 */
export function useItems(query: IItemQuery): IUseItemsResult {
  const [data, setData] = useState<IPageResponse<ISampleItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * 统一写入列表响应，避免自动加载和手动刷新维护两套错误分支。
   */
  const applyItemsResponse = useCallback((response: Awaited<ReturnType<typeof listItems>>) => {
    if (response.code === '200') {
      setData(response.data);
    } else {
      setData(response.data);
      setError(response.codeMsg ?? '事项列表加载失败');
    }
  }, []);

  /*
   * 列表请求需要被分页、筛选和状态流转复用，因此提供稳定 refetch。
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await listItems(query);
    applyItemsResponse(response);
    setLoading(false);
  }, [applyItemsResponse, query]);

  /*
   * 查询条件变化后自动重新加载列表，并避免卸载后继续写入状态。
   */
  useEffect(() => {
    let ignore = false;

    async function loadItemsSafely() {
      setLoading(true);
      setError(null);
      const response = await listItems(query);

      if (ignore) {
        return;
      }

      applyItemsResponse(response);
      setLoading(false);
    }

    void loadItemsSafely();

    return () => {
      ignore = true;
    };
  }, [applyItemsResponse, query]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
