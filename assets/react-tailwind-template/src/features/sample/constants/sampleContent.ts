import type { ISampleContent, IStatusOption } from '@/features/sample/types/sample';

/*
 * 应用静态业务内容，生成新项目后优先替换为用户提供的业务语言。
 */
export const sampleContent: ISampleContent = {
  appName: '__APP_NAME__',
  audience: '业务运营团队',
  job: '跟踪重点事项流转状态、识别风险并安排下一步动作。',
};

/*
 * 状态选项集中维护，避免页面中重复硬编码状态文案。
 */
export const itemStatusOptions: IStatusOption[] = [
  {
    value: 'all',
    label: '全部状态',
  },
  {
    value: 'pending_review',
    label: '待确认',
  },
  {
    value: 'in_review',
    label: '评估中',
  },
  {
    value: 'in_progress',
    label: '处理中',
  },
  {
    value: 'ready_to_close',
    label: '待完成',
  },
];
