import { Bell, LayoutDashboard, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";
import type { IWorkspaceContent } from "../types/workspace";

/*
 * 应用外壳参数，承载全局业务内容和页面主体。
 */
export interface IAppShellProps {
  /*
   * 当前业务工作台内容，用于导航和顶部上下文展示。
   */
  content: IWorkspaceContent;
  /*
   * 页面主体区域，由具体业务页面提供。
   */
  children: ReactNode;
}

/*
 * 提供稳定的应用导航、搜索入口和主体布局。
 */
export function AppShell({ content, children }: IAppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 全局顶栏：展示应用名称、搜索入口和常用工具。 */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LayoutDashboard className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{content.appName}</p>
              <p className="truncate text-xs text-muted-foreground">{content.audience}</p>
            </div>
          </div>

          {/* 搜索入口：业务人员后续可替换为真实全局搜索。 */}
          <label className="hidden min-w-64 max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground md:flex">
            <Search className="size-4" aria-hidden="true" />
            <span>搜索客户、任务或负责人</span>
          </label>

          {/* 工具按钮：保持固定尺寸避免图标状态切换导致布局跳动。 */}
          <div className="flex items-center gap-2">
            <button className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-primary" aria-label="查看提醒">
              <Bell className="size-4" aria-hidden="true" />
            </button>
            <button className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-primary" aria-label="打开设置">
              <Settings className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* 主工作区：页面内容在统一宽度内编排，移动端自动收窄。 */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
