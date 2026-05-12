import { AlertCircle, ChevronLeft, ChevronRight, Clock3, Search } from "lucide-react";
import type { ICustomerItem, ICustomerQuery, IStatusOption } from "../types/workspace";

/*
 * 客户列表组件参数，可替换为订单、工单、审批等业务实体。
 */
export interface ICustomerListProps {
  /*
   * 首屏需要重点跟进的业务对象。
   */
  customers: ICustomerItem[];
  statusOptions: IStatusOption[];
  query: ICustomerQuery;
  total: number;
  loading: boolean;
  error: string | null;
  notice: string | null;
  actioningId: string | null;
  onKeywordChange: (keyword: string) => void;
  onStatusChange: (status: ICustomerQuery["status"]) => void;
  onPageChange: (pageNo: number) => void;
  onAdvance: (customerId: string) => void;
}

/*
 * 展示需要跟进的业务对象、负责人和下一步动作。
 */
export function CustomerList({
  customers,
  statusOptions,
  query,
  total,
  loading,
  error,
  notice,
  actioningId,
  onKeywordChange,
  onStatusChange,
  onPageChange,
  onAdvance,
}: ICustomerListProps) {
  const maxPage = Math.max(1, Math.ceil(total / query.pageSize));

  function confirmAdvance(customer: ICustomerItem) {
    const confirmed = window.confirm(`确认将「${customer.name}」推进到下一阶段？`);

    if (confirmed) {
      onAdvance(customer.id);
    }
  }

  return (
    <aside className="rounded-md border border-border bg-surface p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold">重点跟进</h2>
        <p className="mt-1 text-sm text-muted-foreground">按更新时间和风险优先级处理。</p>
      </div>

      {/* 查询区：关键词和状态都通过 service 层转换为接口查询参数。 */}
      <div className="mt-5 grid gap-3">
        <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            value={query.keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="搜索客户、负责人或状态"
          />
        </label>
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
          value={query.status}
          onChange={(event) => onStatusChange(event.target.value as ICustomerQuery["status"])}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {notice ? <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{notice}</p> : null}

      {/* 跟进列表：每个对象保留状态、动作和新鲜度。 */}
      <div className="mt-5 space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="rounded-md border border-border bg-background p-4">
                <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded-sm bg-muted" />
                <div className="mt-5 h-4 w-48 animate-pulse rounded-sm bg-muted" />
              </article>
            ))
          : customers.map((customer) => (
              <article key={customer.id} className="rounded-md border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{customer.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">负责人：{customer.owner}</p>
                  </div>
                  <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">{customer.statusLabel}</span>
                </div>
                <p className="mt-4 text-sm text-foreground">{customer.nextStep}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    <span>{customer.updatedAt}</span>
                  </div>
                  <button
                    className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={actioningId === customer.id}
                    onClick={() => confirmAdvance(customer)}
                  >
                    {actioningId === customer.id ? "处理中" : "推进"}
                  </button>
                </div>
              </article>
            ))}
      </div>

      {!loading && customers.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-border bg-background p-5 text-center text-sm text-muted-foreground">
          没有匹配的客户，请调整筛选条件。
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          共 {total} 条，{query.pageNo}/{maxPage} 页
        </span>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex size-8 items-center justify-center rounded-md border border-border transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={query.pageNo <= 1 || loading}
            onClick={() => onPageChange(query.pageNo - 1)}
            aria-label="上一页"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            className="inline-flex size-8 items-center justify-center rounded-md border border-border transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={query.pageNo >= maxPage || loading}
            onClick={() => onPageChange(query.pageNo + 1)}
            aria-label="下一页"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
