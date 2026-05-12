import type { ICustomerItem, IMetricItem, IStatusOption, IWorkflowStage, IWorkspaceContent } from "../types/workspace";

/*
 * 应用静态业务内容，生成新项目后优先替换为用户提供的业务语言。
 */
export const mockWorkspaceContent: IWorkspaceContent = {
  appName: "__APP_NAME__",
  audience: "销售运营团队",
  job: "跟踪重点客户推进状态、识别风险并安排下一步动作。",
};

/*
 * 状态选项集中维护，避免页面中重复硬编码状态文案。
 */
export const customerStatusOptions: IStatusOption[] = [
  {
    value: "all",
    label: "全部状态",
  },
  {
    value: "contract_pending",
    label: "合同待确认",
  },
  {
    value: "budget_review",
    label: "预算审批中",
  },
  {
    value: "solution_review",
    label: "方案评审中",
  },
  {
    value: "delivery_ready",
    label: "交付准备中",
  },
];

/*
 * 顶部指标 mock，后续应由 GET /api/workspace/dashboard 返回。
 */
export const mockMetrics: IMetricItem[] = [
  {
    label: "本周新增商机",
    value: "128",
    delta: "+18 较上周",
    tone: "good",
  },
  {
    label: "高风险客户",
    value: "12",
    delta: "4 个超过 SLA",
    tone: "warning",
  },
  {
    label: "预计成交额",
    value: "¥846k",
    delta: "目标完成 72%",
    tone: "neutral",
  },
  {
    label: "待跟进任务",
    value: "36",
    delta: "今日需处理",
    tone: "danger",
  },
];

/*
 * 工作流阶段 mock，按业务实际流程替换阶段名称、数量和动作。
 */
export const mockWorkflow: IWorkflowStage[] = [
  {
    name: "线索进入",
    count: 42,
    action: "完成资质初筛",
  },
  {
    name: "方案确认",
    count: 28,
    action: "补齐预算和联系人",
  },
  {
    name: "合同推进",
    count: 17,
    action: "同步法务反馈",
  },
  {
    name: "交付准备",
    count: 9,
    action: "确认启动时间",
  },
];

/*
 * 重点跟进客户 mock，service 会从这里读取并模拟接口查询与状态推进。
 */
export const mockCustomers: ICustomerItem[] = [
  {
    id: "acct-001",
    name: "华东零售集团",
    owner: "Mia",
    status: "contract_pending",
    statusLabel: "合同待确认",
    nextStep: "明日 10:00 前发送修订版",
    updatedAt: "12 分钟前",
  },
  {
    id: "acct-002",
    name: "北辰制造",
    owner: "Chen",
    status: "budget_review",
    statusLabel: "预算审批中",
    nextStep: "补充 ROI 测算",
    updatedAt: "1 小时前",
  },
  {
    id: "acct-003",
    name: "星河医药",
    owner: "Lin",
    status: "solution_review",
    statusLabel: "方案评审中",
    nextStep: "安排安全答疑",
    updatedAt: "昨天",
  },
  {
    id: "acct-004",
    name: "南湖能源",
    owner: "Qiao",
    status: "delivery_ready",
    statusLabel: "交付准备中",
    nextStep: "确认启动会参会名单",
    updatedAt: "2 天前",
  },
];
