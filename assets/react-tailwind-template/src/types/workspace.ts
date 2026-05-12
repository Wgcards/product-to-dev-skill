/*
 * 指标状态的视觉语义，用于让业务数据和展示色彩保持解耦。
 */
export type TMetricTone = "neutral" | "good" | "warning" | "danger";

/*
 * 客户推进状态编码，真实项目中应与接口文档和数据库状态字段保持一致。
 */
export type TCustomerStatus = "contract_pending" | "budget_review" | "solution_review" | "delivery_ready";

/*
 * 列表筛选状态，all 仅用于前端查询条件。
 */
export type TCustomerStatusFilter = "all" | TCustomerStatus;

/*
 * 单个顶部指标的业务含义、当前值与趋势说明。
 */
export interface IMetricItem {
  label: string;
  value: string;
  delta: string;
  tone: TMetricTone;
}

/*
 * 工作流阶段，表示业务对象从进入系统到完成交付的关键节点。
 */
export interface IWorkflowStage {
  name: string;
  count: number;
  action: string;
}

/*
 * 业务列表中的客户、订单、线索或任务实体。
 */
export interface ICustomerItem {
  id: string;
  name: string;
  owner: string;
  status: TCustomerStatus;
  statusLabel: string;
  nextStep: string;
  updatedAt: string;
}

/*
 * 状态筛选下拉选项。
 */
export interface IStatusOption {
  value: TCustomerStatusFilter;
  label: string;
}

/*
 * 应用静态业务文案，优先根据用户需求替换这里的工作台语言。
 */
export interface IWorkspaceContent {
  appName: string;
  audience: string;
  job: string;
}

/*
 * 首屏看板接口返回的数据结构。
 */
export interface IWorkspaceDashboardData {
  metrics: IMetricItem[];
  workflow: IWorkflowStage[];
}

/*
 * 重点跟进列表查询条件。
 */
export interface ICustomerQuery {
  keyword: string;
  status: TCustomerStatusFilter;
  pageNo: number;
  pageSize: number;
}
