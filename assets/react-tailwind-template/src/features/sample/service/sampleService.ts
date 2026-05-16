import { APIClient } from '@/shared/tools/APIClient';
import type { IApiResponse, IPageResponse } from '@/types/dto/api';
import type { IItemActionRequestDTO } from '@/types/dto/sample';
import type { IItemQuery, ISampleDashboardData, ISampleItem } from '@/features/sample/types/sample';

/*
 * 获取示例看板数据，对应 OpenAPI operationId: getSampleDashboard。
 */
export function getSampleDashboard(): Promise<IApiResponse<ISampleDashboardData>> {
  return APIClient<ISampleDashboardData>('/api/sample/dashboard');
}

/*
 * 查询重点处理事项，对应 OpenAPI operationId: listItems。
 */
export function listItems(query: IItemQuery): Promise<IApiResponse<IPageResponse<ISampleItem>>> {
  const params = new URLSearchParams({
    keyword: query.keyword,
    status: query.status,
    pageNo: String(query.pageNo),
    pageSize: String(query.pageSize),
  });

  return APIClient<IPageResponse<ISampleItem>>(`/api/items?${params.toString()}`);
}

/*
 * 流转事项状态，对应 OpenAPI operationId: runItemAction。
 */
export function runItemAction(
  itemId: string,
  operatorNote: string,
): Promise<IApiResponse<ISampleItem | null>> {
  return APIClient<ISampleItem | null, IItemActionRequestDTO>(`/api/items/${itemId}/action`, {
    method: 'POST',
    body: {
      operatorNote,
    },
  });
}
