import { create } from 'zustand';

/*
 * 全局应用 store 只保存跨业务域共享的外壳状态。
 */
export interface IAppStoreState {
  /*
   * 顶栏全局搜索关键词，可被不同页面读取。
   */
  globalSearchKeyword: string;
  /*
   * 更新顶栏全局搜索关键词。
   */
  setGlobalSearchKeyword: (keyword: string) => void;
  /*
   * 清空顶栏搜索状态。
   */
  resetGlobalSearchKeyword: () => void;
}

/*
 * 全局 app store，避免把业务域筛选、弹窗和接口数据混入共享状态。
 */
export const useAppStore = create<IAppStoreState>((set) => ({
  globalSearchKeyword: '',
  setGlobalSearchKeyword(keyword) {
    set({ globalSearchKeyword: keyword });
  },
  resetGlobalSearchKeyword() {
    set({ globalSearchKeyword: '' });
  },
}));
