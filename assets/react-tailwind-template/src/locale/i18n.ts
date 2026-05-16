import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './en-US.json';
import zhCN from './zh-CN.json';

/*
 * 模板默认国际化实例，中文是人工维护源语言，英文由同步流程补齐。
 */
export const i18n = i18next.createInstance();

void i18n.use(initReactI18next).init({
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    'zh-CN': {
      translation: zhCN,
    },
    'en-US': {
      translation: enUS,
    },
  },
});
