import { useEffect, useState } from "react";
import { customerStatusOptions } from "../mocks/mock-data";
import { advanceCustomerStatus, getWorkspaceDashboard, listCustomers } from "../services/workspace-service";
import type { IPageResponse } from "../types/api";
import type { ICustomerItem, ICustomerQuery, IWorkspaceContent, IWorkspaceDashboardData } from "../types/workspace";
import { CustomerList } from "./CustomerList";
import { MetricRail } from "./MetricRail";
import { WorkflowBoard } from "./WorkflowBoard";

/*
 * 业务看板组件参数，集中接收可编辑业务内容。
 */
export interface IBusinessDashboardProps {
  /*
   * 当前工作台的指标、流程和业务对象列表。
   */
  content: IWorkspaceContent;
}

const initialQuery: ICustomerQuery = {
  keyword: "",
  status: "all",
  pageNo: 1,
  pageSize: 5,
};

/*
 * 编排首屏业务看板，把指标、流程和跟进列表拆成独立区块。
 */
export function BusinessDashboard({ content }: IBusinessDashboardProps) {
  const [dashboardData, setDashboardData] = useState<IWorkspaceDashboardData | null>(null);
  const [customerPage, setCustomerPage] = useState<IPageResponse<ICustomerItem> | null>(null);
  const [query, setQuery] = useState<ICustomerQuery>(initialQuery);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  /*
   * 首屏看板数据通过 service 获取，后续替换真实接口时页面结构无需重写。
   */
  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setDashboardLoading(true);
      const response = await getWorkspaceDashboard();

      if (!ignore) {
        setDashboardData(response.data);
        setDashboardLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  /*
   * 列表查询响应筛选、分页和错误态变化，保持 mock 与真实接口的接入形态一致。
   */
  useEffect(() => {
    let ignore = false;

    async function loadCustomers() {
      setCustomerLoading(true);
      setCustomerError(null);
      const response = await listCustomers(query);

      if (ignore) {
        return;
      }

      if (response.code !== "200") {
        setCustomerPage(response.data);
        setCustomerError(response.codeMsg ?? "查询失败");
      } else {
        setCustomerPage(response.data);
      }

      setCustomerLoading(false);
    }

    void loadCustomers();

    return () => {
      ignore = true;
    };
  }, [query]);

  function updateKeyword(keyword: string) {
    setNotice(null);
    setQuery((current) => ({
      ...current,
      keyword,
      pageNo: 1,
    }));
  }

  function updateStatus(status: ICustomerQuery["status"]) {
    setNotice(null);
    setQuery((current) => ({
      ...current,
      status,
      pageNo: 1,
    }));
  }

  function updatePage(pageNo: number) {
    setQuery((current) => ({
      ...current,
      pageNo,
    }));
  }

  async function handleAdvance(customerId: string) {
    setActioningId(customerId);
    setNotice(null);
    const response = await advanceCustomerStatus(customerId);

    if (response.code === "200") {
      setNotice("客户状态已推进，列表数据已刷新。");
      const latestPage = await listCustomers(query);
      setCustomerPage(latestPage.data);
    } else {
      setNotice(response.codeMsg ?? "状态推进失败");
    }

    setActioningId(null);
  }

  return (
    <div className="space-y-6">
      {/* 页面上下文：用任务说明帮助用户确认当前工作范围。 */}
      <section className="grid gap-4 border-b border-border pb-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <p className="text-sm font-medium text-primary">{content.audience}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {content.appName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{content.job}</p>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">今日重点</p>
          <p className="mt-2 text-sm text-foreground">优先处理高风险客户和超过 SLA 的跟进任务。</p>
        </div>
      </section>

      {/* 指标区：用于快速判断业务健康度。 */}
      <MetricRail metrics={dashboardData?.metrics ?? []} loading={dashboardLoading} />

      {/* 业务主体：流程和列表并排展示，移动端按顺序堆叠。 */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <WorkflowBoard stages={dashboardData?.workflow ?? []} loading={dashboardLoading} />
        <CustomerList
          customers={customerPage?.records ?? []}
          statusOptions={customerStatusOptions}
          query={query}
          total={customerPage?.total ?? 0}
          loading={customerLoading}
          error={customerError}
          notice={notice}
          actioningId={actioningId}
          onKeywordChange={updateKeyword}
          onStatusChange={updateStatus}
          onPageChange={updatePage}
          onAdvance={handleAdvance}
        />
      </section>
    </div>
  );
}
