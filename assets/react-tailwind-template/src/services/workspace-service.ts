import { customerStatusOptions, mockCustomers, mockMetrics, mockWorkflow } from "../mocks/mock-data";
import type { IApiResponse, IPageResponse } from "../types/api";
import type { ICustomerItem, ICustomerQuery, IWorkspaceDashboardData, TCustomerStatus } from "../types/workspace";
import { apiRequest, isRealApiEnabled } from "./api-client";

const mockLatency = 260;

const nextStatusMap: Partial<Record<TCustomerStatus, TCustomerStatus>> = {
  contract_pending: "budget_review",
  budget_review: "solution_review",
  solution_review: "delivery_ready",
};

/*
 * 模拟接口延迟，让加载态和错误态在演示时可被真实触发。
 */
function waitForMockLatency(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, mockLatency);
  });
}

/*
 * 构造成功响应，保持 mock 与后端统一响应结构一致。
 */
function ok<TData>(data: TData): IApiResponse<TData> {
  return {
    data,
    code: "200",
    codeMsg: null,
  };
}

/*
 * 构造失败响应，前端会直接展示 codeMsg。
 */
function fail<TData>(data: TData, codeMsg: string): IApiResponse<TData> {
  return {
    data,
    code: "400",
    codeMsg,
  };
}

/*
 * TODO backend: GET /api/workspace/dashboard - replace mock after Java API is ready.
 */
export async function getWorkspaceDashboard(): Promise<IApiResponse<IWorkspaceDashboardData>> {
  if (isRealApiEnabled()) {
    return apiRequest<IWorkspaceDashboardData>("/api/workspace/dashboard");
  }

  await waitForMockLatency();

  return ok({
    metrics: mockMetrics,
    workflow: mockWorkflow,
  });
}

/*
 * TODO backend: GET /api/customers - replace mock after Java API is ready.
 */
export async function listCustomers(query: ICustomerQuery): Promise<IApiResponse<IPageResponse<ICustomerItem>>> {
  if (isRealApiEnabled()) {
    const params = new URLSearchParams({
      keyword: query.keyword,
      status: query.status,
      pageNo: String(query.pageNo),
      pageSize: String(query.pageSize),
    });

    return apiRequest<IPageResponse<ICustomerItem>>(`/api/customers?${params.toString()}`);
  }

  await waitForMockLatency();

  if (query.keyword.trim().toLowerCase() === "error") {
    return fail(
      {
        records: [],
        pageNo: query.pageNo,
        pageSize: query.pageSize,
        total: 0,
      },
      "模拟接口异常：请更换关键词后重试",
    );
  }

  const keyword = query.keyword.trim().toLowerCase();
  const filtered = mockCustomers.filter((customer) => {
    const matchesKeyword =
      !keyword ||
      customer.name.toLowerCase().includes(keyword) ||
      customer.owner.toLowerCase().includes(keyword) ||
      customer.statusLabel.toLowerCase().includes(keyword);
    const matchesStatus = query.status === "all" || customer.status === query.status;

    return matchesKeyword && matchesStatus;
  });
  const startIndex = (query.pageNo - 1) * query.pageSize;

  return ok({
    records: filtered.slice(startIndex, startIndex + query.pageSize),
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    total: filtered.length,
  });
}

/*
 * TODO backend: POST /api/customers/{customerId}/advance - replace mock after Java API is ready.
 */
export async function advanceCustomerStatus(customerId: string): Promise<IApiResponse<ICustomerItem | null>> {
  if (isRealApiEnabled()) {
    return apiRequest<ICustomerItem | null>(`/api/customers/${customerId}/advance`, {
      method: "POST",
    });
  }

  await waitForMockLatency();

  const customer = mockCustomers.find((item) => item.id === customerId);
  if (!customer) {
    return fail(null, "客户不存在或已被删除");
  }

  const nextStatus = nextStatusMap[customer.status];
  if (!nextStatus) {
    return fail(null, "当前客户已进入交付准备，不能继续推进");
  }

  const nextOption = customerStatusOptions.find((option) => option.value === nextStatus);
  customer.status = nextStatus;
  customer.statusLabel = nextOption?.label ?? customer.statusLabel;
  customer.nextStep = "已推进到下一阶段，请补充对应资料";
  customer.updatedAt = "刚刚";

  return ok({ ...customer });
}
