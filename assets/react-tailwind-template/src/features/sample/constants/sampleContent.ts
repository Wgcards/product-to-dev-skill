import type { ISampleContent, IStatusOption } from '@/features/sample/types/sample';

/*
 * 生成应用业务内容，文案从 locale 读取，避免模板复制出硬编码 UI 文案。
 */
export function createSampleContent(t: (key: string) => string): ISampleContent {
  return {
    appName: '__APP_NAME__',
    audience: t('sample.content.audience'),
    job: t('sample.content.job'),
  };
}

/*
 * 状态选项集中维护，展示文案从 locale 读取。
 */
export function createItemStatusOptions(t: (key: string) => string): IStatusOption[] {
  return [
    {
      value: 'all',
      label: t('sample.status.all'),
    },
    {
      value: 'pending_review',
      label: t('sample.status.pendingReview'),
    },
    {
      value: 'in_review',
      label: t('sample.status.inReview'),
    },
    {
      value: 'in_progress',
      label: t('sample.status.inProgress'),
    },
    {
      value: 'ready_to_close',
      label: t('sample.status.readyToClose'),
    },
  ];
}
