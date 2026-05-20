import { useTranslation } from 'react-i18next';
import { AppShell } from '@/app/components/AppShell';
import { SamplePage } from '@/features/sample';
import { createSampleContent } from '@/features/sample/constants/sampleContent';

/*
 * 应用入口只负责装配顶层外壳和默认业务域，路由增加后仍保持这里作为编排层。
 */
export function App() {
  const { t } = useTranslation();
  const sampleContent = createSampleContent(t);

  return (
    <AppShell content={sampleContent}>
      <SamplePage content={sampleContent} />
    </AppShell>
  );
}
