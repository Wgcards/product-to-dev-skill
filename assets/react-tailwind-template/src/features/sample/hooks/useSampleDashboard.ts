import { useEffect, useState } from 'react';
import { getSampleDashboard } from '@/features/sample/service/sampleService';
import type { ISampleDashboardData } from '@/features/sample/types/sample';

/*
 * 示例看板请求状态，供页面编排层消费。
 */
export interface IUseSampleDashboardResult {
  /*
   * 看板指标和流程数据。
   */
  data: ISampleDashboardData | null;
  /*
   * 首屏看板是否正在加载。
   */
  loading: boolean;
  /*
   * 看板请求错误文案。
   */
  error: string | null;
}

/*
 * 加载示例看板数据，只负责 dashboard 请求和请求态管理。
 */
export function useSampleDashboard(): IUseSampleDashboardResult {
  const [data, setData] = useState<ISampleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * 首屏请求需要防止组件卸载后继续写入状态。
   */
  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      const response = await getSampleDashboard();

      if (ignore) {
        return;
      }

      if (response.code === '200') {
        setData(response.data);
      } else {
        setError(response.codeMsg ?? '看板数据加载失败');
      }

      setLoading(false);
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}
