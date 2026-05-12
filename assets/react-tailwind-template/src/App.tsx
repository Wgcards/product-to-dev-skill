import { AppShell } from "./components/AppShell";
import { BusinessDashboard } from "./components/BusinessDashboard";
import { workspaceContent } from "./businessContent";

/*
 * 页面入口只负责装配业务内容和布局组件，具体区块逻辑拆到 components 中维护。
 */
export function App() {
  return (
    <AppShell content={workspaceContent}>
      <BusinessDashboard content={workspaceContent} />
    </AppShell>
  );
}
