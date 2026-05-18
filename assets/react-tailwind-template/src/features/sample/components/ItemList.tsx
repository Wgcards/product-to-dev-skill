import { ChevronLeft, ChevronRight, Clock3, Search } from 'lucide-react';
import type { IItemQuery, ISampleItem, IStatusOption } from '@/features/sample/types/sample';

/*
 * 事项列表组件参数，可替换为订单、工单、审批等业务实体。
 */
export interface IItemListProps {
  /*
   * 首屏需要重点处理的业务对象。
   */
  items: ISampleItem[];
  /*
   * 状态筛选选项。
   */
  statusOptions: IStatusOption[];
  /*
   * 当前列表查询条件。
   */
  query: IItemQuery;
  /*
   * 满足条件的总记录数。
   */
  total: number;
  /*
   * 列表加载态。
   */
  loading: boolean;
  /*
   * 当前正在流转的事项 ID。
   */
  actioningId: string | null;
  /*
   * 更新关键词筛选。
   */
  onKeywordChange: (keyword: string) => void;
  /*
   * 更新状态筛选。
   */
  onStatusChange: (status: IItemQuery['status']) => void;
  /*
   * 更新页码。
   */
  onPageChange: (pageNo: number) => void;
  /*
   * 请求打开事项流转确认弹窗。
   */
  onActionRequest: (item: ISampleItem) => void;
}

/*
 * 展示需要处理的业务对象、负责人和下一步动作。
 */
export function ItemList({
  items,
  statusOptions,
  query,
  total,
  loading,
  actioningId,
  onKeywordChange,
  onStatusChange,
  onPageChange,
  onActionRequest,
}: IItemListProps) {
  const maxPage = Math.max(1, Math.ceil(total / query.pageSize));

  return (
    <aside className="rounded-md border border-border bg-surface p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold">重点处理</h2>
        <p className="mt-1 text-sm text-muted-foreground">按更新时间和风险优先级处理。</p>
      </div>

      {/* 查询区：关键词和状态都通过 sample store 写入业务域筛选状态。 */}
      <div className="mt-5 grid gap-3">
        <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            value={query.keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="搜索事项、负责人或状态"
          />
        </label>
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
          value={query.status}
          onChange={(event) => onStatusChange(event.target.value as IItemQuery['status'])}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 处理列表：每个对象保留状态、动作和新鲜度。 */}
      <div className="mt-5 space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="rounded-md border border-border bg-background p-4">
                <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded-sm bg-muted" />
                <div className="mt-5 h-4 w-48 animate-pulse rounded-sm bg-muted" />
              </article>
            ))
          : items.map((item) => (
              <article key={item.id} className="rounded-md border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">负责人：{item.owner}</p>
                  </div>
                  <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {item.statusLabel}
                  </span>
                </div>
                <p className="mt-4 text-sm text-foreground">{item.nextStep}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    <span>{item.updatedAt}</span>
                  </div>
                  <button
                    className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={actioningId === item.id}
                    onClick={() => onActionRequest(item)}
                  >
                    {actioningId === item.id ? '处理中' : '流转'}
                  </button>
                </div>
              </article>
            ))}
      </div>

      {!loading && items.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-border bg-background p-5 text-center text-sm text-muted-foreground">
          没有匹配的事项，请调整筛选条件。
        </div>
      ) : null}

      {/* 分页区：上一页和下一页保持固定按钮尺寸。 */}
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
