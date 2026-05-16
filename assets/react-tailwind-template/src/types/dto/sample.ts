/*
 * 指标 DTO，对应 OpenAPI 中 MetricItem schema。
 */
export interface IMetricDTO {
  /*
   * 指标名称，用于卡片标题。
   */
  label: string;
  /*
   * 指标当前展示值，可包含单位。
   */
  value: string;
  /*
   * 指标趋势或补充说明。
   */
  delta: string;
  /*
   * 指标视觉语义编码。
   */
  tone: 'neutral' | 'good' | 'warning' | 'danger';
}

/*
 * 流程阶段 DTO，对应 OpenAPI 中 WorkflowStage schema。
 */
export interface IWorkflowStageDTO {
  /*
   * 阶段名称。
   */
  name: string;
  /*
   * 当前阶段待处理对象数量。
   */
  count: number;
  /*
   * 当前阶段推荐的下一步动作。
   */
  action: string;
}

/*
 * 事项 DTO，对应 OpenAPI 中 SampleItem schema。
 */
export interface ISampleItemDTO {
  /*
   * 业务对象唯一标识。
   */
  id: string;
  /*
   * 业务对象名称。
   */
  name: string;
  /*
   * 当前负责人名称。
   */
  owner: string;
  /*
   * 当前流转状态编码。
   */
  status: 'pending_review' | 'in_review' | 'in_progress' | 'ready_to_close';
  /*
   * 当前流转状态展示文案。
   */
  statusLabel: string;
  /*
   * 下一步建议动作。
   */
  nextStep: string;
  /*
   * 最近更新时间展示文案。
   */
  updatedAt: string;
}

/*
 * 示例看板 DTO，对应 OpenAPI 中 SampleDashboardData schema。
 */
export interface ISampleDashboardDTO {
  /*
   * 顶部业务指标列表。
   */
  metrics: IMetricDTO[];
  /*
   * 当前业务流程阶段统计。
   */
  workflow: IWorkflowStageDTO[];
}

/*
 * 事项列表 DTO，对应 OpenAPI 中 ItemPageData schema。
 */
export interface ISamplePageDTO {
  /*
   * 当前页业务对象记录。
   */
  records: ISampleItemDTO[];
  /*
   * 当前页码，从 1 开始。
   */
  pageNo: number;
  /*
   * 每页记录数。
   */
  pageSize: number;
  /*
   * 满足筛选条件的总记录数。
   */
  total: number;
}

/*
 * 事项流转请求 DTO，对应 OpenAPI requestBody: item-action。
 */
export interface IItemActionRequestDTO {
  /*
   * 流转备注，用于记录人工确认依据，必填且最多 200 字。
   */
  operatorNote: string;
}
