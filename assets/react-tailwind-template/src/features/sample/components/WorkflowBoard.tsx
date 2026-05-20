import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFeedback } from '@/shared/feedback/FeedbackContext';
import { formatStageCount } from '@/features/sample/tools/formatters';
import type { IWorkflowStage } from '@/features/sample/types/sample';

/*
 * 工作流组件参数，描述业务对象的阶段流转。
 */
export interface IWorkflowBoardProps {
  /*
   * 按业务顺序排列的工作流阶段。
   */
  stages: IWorkflowStage[];
  /*
   * 数据加载态。
   */
  loading: boolean;
}

/*
 * 展示业务流转阶段和每个阶段的下一步动作。
 */
export function WorkflowBoard({ stages, loading }: IWorkflowBoardProps) {
  const { t } = useTranslation();
  const { showFeedback } = useFeedback();

  /*
   * 进入新建任务流程；真实项目中通常会打开业务域 Dialog 或路由。
   */
  function startCreateTask() {
    showFeedback({
      message: t('sample.workflow.createStarted'),
      severity: 'info',
    });
  }

  /*
   * 进入指定阶段处理队列，当前模板用全局 Snackbar 展示反馈。
   */
  function handleStage(stage: IWorkflowStage) {
    showFeedback({
      message: t('sample.workflow.stageEntered', { stageName: stage.name }),
      severity: 'info',
    });
  }

  return (
    <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{t('sample.workflow.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('sample.workflow.description')}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          onClick={startCreateTask}
        >
          {t('sample.workflow.createTask')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* 阶段列表：每一行代表一个可执行的业务节点。 */}
      <div className="mt-5 space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <article
                key={index}
                className="grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
              >
                <div className="h-8 w-12 animate-pulse rounded-sm bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
                  <div className="h-4 w-48 animate-pulse rounded-sm bg-muted" />
                </div>
                <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
              </article>
            ))
          : stages.map((stage, index) => (
              <article
                key={stage.name}
                className="grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
              >
                <div className="text-2xl font-semibold text-primary">
                  {formatStageCount(stage.count)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{stage.name}</span>
                    <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {t('sample.workflow.stepLabel', { step: index + 1 })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{stage.action}</p>
                </div>
                <button
                  className="justify-self-start rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary sm:justify-self-end"
                  onClick={() => handleStage(stage)}
                >
                  {t('sample.action.handle')}
                </button>
              </article>
            ))}
      </div>
    </section>
  );
}
