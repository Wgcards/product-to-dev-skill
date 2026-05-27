import { ArrowUpRight, CircleAlert, CircleCheck, Minus } from 'lucide-react';
import type { IMetricItem, MetricTone } from '@/features/sample/types/sample';

const toneClassName: Record<MetricTone, string> = {
  neutral: 'text-muted-foreground bg-muted',
  good: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-danger bg-danger/10',
};

const toneIcon = {
  neutral: Minus,
  good: CircleCheck,
  warning: CircleAlert,
  danger: ArrowUpRight,
};

/*
 * 指标栏组件参数，接收顶部业务指标集合。
 */
export interface IMetricRailProps {
  /*
   * 需要在首屏横向展示的关键指标。
   */
  metrics: IMetricItem[];
  /*
   * 数据加载态，用于展示稳定骨架，避免首屏跳动。
   */
  loading: boolean;
}

/*
 * 渲染关键指标，帮助用户在进入列表前快速判断优先级。
 */
export function MetricRail({ metrics, loading }: IMetricRailProps) {
  if (loading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="min-h-32 animate-pulse rounded-md border border-border bg-surface p-4"
          >
            <div className="h-4 w-28 rounded-sm bg-muted" />
            <div className="mt-6 h-8 w-20 rounded-sm bg-muted" />
            <div className="mt-3 h-4 w-32 rounded-sm bg-muted" />
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = toneIcon[metric.tone];

        return (
          /* 单个指标：保持固定最小高度，避免数值变化造成首屏跳动。 */
          <article
            key={metric.label}
            className="min-h-32 rounded-md border border-border bg-surface p-4 transition hover:border-primary/60"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <span
                className={`inline-flex size-8 items-center justify-center rounded-md ${toneClassName[metric.tone]}`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-normal">{metric.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{metric.delta}</p>
          </article>
        );
      })}
    </section>
  );
}
