import { useEffect, useState } from 'react';
import { ItemActionDialog } from '@/features/sample/components/ItemActionDialog';
import { ItemList } from '@/features/sample/components/ItemList';
import { MetricRail } from '@/features/sample/components/MetricRail';
import { WorkflowBoard } from '@/features/sample/components/WorkflowBoard';
import { itemStatusOptions } from '@/features/sample/constants/sampleContent';
import { useItemAction } from '@/features/sample/hooks/useItemAction';
import { useItems } from '@/features/sample/hooks/useItems';
import { useSampleDashboard } from '@/features/sample/hooks/useSampleDashboard';
import { useSampleStore } from '@/features/sample/store/useSampleStore';
import type { ISampleContent, ISampleItem } from '@/features/sample/types/sample';
import { useFeedback } from '@/shared/feedback/FeedbackContext';

/*
 * 示例看板页面参数，集中接收可编辑业务内容。
 */
export interface ISamplePageProps {
  /*
   * 当前示例看板的标题、角色和任务说明。
   */
  content: ISampleContent;
}

/*
 * 编排首屏业务看板，把指标、流程、处理列表和状态流转串联起来。
 */
export function SamplePage({ content }: ISamplePageProps) {
  const itemQuery = useSampleStore((state) => state.itemQuery);
  const pendingActionItem = useSampleStore((state) => state.pendingActionItem);
  const setKeyword = useSampleStore((state) => state.setKeyword);
  const setStatus = useSampleStore((state) => state.setStatus);
  const setPageNo = useSampleStore((state) => state.setPageNo);
  const openActionDialog = useSampleStore((state) => state.openActionDialog);
  const closeActionDialog = useSampleStore((state) => state.closeActionDialog);
  const dashboard = useSampleDashboard();
  const items = useItems(itemQuery);
  const itemAction = useItemAction();
  const { showFeedback } = useFeedback();
  const [actionNote, setActionNote] = useState('');
  const [actionNoteError, setActionNoteError] = useState<string | null>(null);

  /*
   * 请求错误统一进入全局 Snackbar，避免页面内平铺 notice 或 error。
   */
  useEffect(() => {
    if (dashboard.error) {
      showFeedback({
        message: dashboard.error,
        severity: 'error',
      });
    }
  }, [dashboard.error, showFeedback]);

  /*
   * 列表错误统一进入全局 Snackbar，列表区域只保留数据、空态和加载态。
   */
  useEffect(() => {
    if (items.error) {
      showFeedback({
        message: items.error,
        severity: 'error',
      });
    }
  }, [items.error, showFeedback]);

  /*
   * 更新备注输入时同步清理错误，错误文案始终显示在 TextField 下方。
   */
  function updateActionNote(value: string) {
    setActionNote(value);
    setActionNoteError(null);
  }

  /*
   * 关闭流转弹窗并清空表单状态。
   */
  function closeActionDialogWithFormReset() {
    closeActionDialog();
    setActionNote('');
    setActionNoteError(null);
  }

  /*
   * 打开流转弹窗前重置表单，避免复用上一位事项的备注和错误。
   */
  function openActionDialogWithFormReset(item: ISampleItem) {
    setActionNote('');
    setActionNoteError(null);
    openActionDialog(item);
  }

  /*
   * 确认流转后刷新列表，并用 Snackbar 反馈业务结果。
   */
  async function confirmActionItem() {
    if (!pendingActionItem) {
      return;
    }

    const normalizedActionNote = actionNote.trim();

    if (!normalizedActionNote) {
      setActionNoteError('请输入流转备注。');
      return;
    }

    if (normalizedActionNote.length > 200) {
      setActionNoteError('流转备注不能超过 200 字。');
      return;
    }

    const response = await itemAction.runItemAction(pendingActionItem.id, normalizedActionNote);

    if (response.code === '200') {
      showFeedback({
        message: '事项状态已流转，列表数据已刷新。',
        severity: 'success',
      });
      closeActionDialogWithFormReset();
      await items.refetch();
    } else {
      showFeedback({
        message: response.codeMsg ?? '状态流转失败',
        severity: 'error',
      });
    }
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
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            今日重点
          </p>
          <p className="mt-2 text-sm text-foreground">优先处理高风险事项和超过 SLA 的处理任务。</p>
        </div>
      </section>

      {/* 指标区：用于快速判断业务健康度。 */}
      <MetricRail metrics={dashboard.data?.metrics ?? []} loading={dashboard.loading} />

      {/* 业务主体：流程和列表并排展示，移动端按顺序堆叠。 */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <WorkflowBoard stages={dashboard.data?.workflow ?? []} loading={dashboard.loading} />
        <ItemList
          items={items.data?.records ?? []}
          statusOptions={itemStatusOptions}
          query={itemQuery}
          total={items.data?.total ?? 0}
          loading={items.loading}
          actioningId={itemAction.actioningId}
          onKeywordChange={setKeyword}
          onStatusChange={setStatus}
          onPageChange={setPageNo}
          onActionRequest={openActionDialogWithFormReset}
        />
      </section>

      {/* 状态流转确认：危险操作统一使用 MUI Dialog 承载。 */}
      <ItemActionDialog
        open={Boolean(pendingActionItem)}
        item={pendingActionItem}
        loading={itemAction.actioningId === pendingActionItem?.id}
        operatorNote={actionNote}
        operatorNoteError={actionNoteError}
        onClose={closeActionDialogWithFormReset}
        onOperatorNoteChange={updateActionNote}
        onConfirm={confirmActionItem}
      />
    </div>
  );
}
