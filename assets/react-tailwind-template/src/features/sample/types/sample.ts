/*
 * 指标状态的视觉语义，用于让业务数据和展示色彩保持解耦。
 */
export type TMetricTone = 'neutral' | 'good' | 'warning' | 'danger';

/*
 * 事项流转状态编码，真实项目中应与接口文档和数据库状态字段保持一致。
 */
export type TItemStatus = 'pending_review' | 'in_review' | 'in_progress' | 'ready_to_close';

/*
 * 列表筛选状态，all 仅用于前端查询条件。
 */
export type TItemStatusFilter = 'all' | TItemStatus;

/*
 * 单个顶部指标的业务含义、当前值与趋势说明。
 */
export interface IMetricItem {
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
   * 指标视觉语义，不直接绑定具体颜色值。
   */
  tone: TMetricTone;
}

/*
 * 工作流阶段，表示业务对象从进入系统到完成完成的关键节点。
 */
export interface IWorkflowStage {
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
 * 业务列表中的事项、订单、线索或任务实体。
 */
export interface ISampleItem {
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
  status: TItemStatus;
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
 * 状态筛选下拉选项。
 */
export interface IStatusOption {
  /*
   * 筛选状态值。
   */
  value: TItemStatusFilter;
  /*
   * 状态展示文案。
   */
  label: string;
}

/*
 * 应用静态业务文案，优先根据用户需求替换这里的示例看板语言。
 */
export interface ISampleContent {
  /*
   * 应用或业务示例看板名称。
   */
  appName: string;
  /*
   * 当前页面服务的主要角色。
   */
  audience: string;
  /*
   * 页面帮助用户完成的业务任务。
   */
  job: string;
}

/*
 * 首屏看板接口返回的数据结构。
 */
export interface ISampleDashboardData {
  /*
   * 顶部关键指标集合。
   */
  metrics: IMetricItem[];
  /*
   * 业务流程阶段集合。
   */
  workflow: IWorkflowStage[];
}

/*
 * 重点处理列表查询条件。
 */
export interface IItemQuery {
  /*
   * 关键词筛选，匹配事项、负责人或状态。
   */
  keyword: string;
  /*
   * 状态筛选条件。
   */
  status: TItemStatusFilter;
  /*
   * 当前页码，从 1 开始。
   */
  pageNo: number;
  /*
   * 每页记录数。
   */
  pageSize: number;
}
