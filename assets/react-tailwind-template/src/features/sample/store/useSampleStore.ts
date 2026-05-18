import { create } from 'zustand';
import type { IItemQuery, ISampleItem } from '@/features/sample/types/sample';

/*
 * 示例看板列表默认查询条件，集中维护避免组件内重复创建。
 */
export const initialItemQuery: IItemQuery = {
  keyword: '',
  status: 'all',
  pageNo: 1,
  pageSize: 5,
};

/*
 * 示例看板业务域 store，只保存筛选和弹窗这类可共享 UI 状态。
 */
export interface ISampleStoreState {
  /*
   * 事项列表查询条件。
   */
  itemQuery: IItemQuery;
  /*
   * 等待确认流转的事项；为空表示确认弹窗关闭。
   */
  pendingActionItem: ISampleItem | null;
  /*
   * 更新关键词并回到第一页。
   */
  setKeyword: (keyword: string) => void;
  /*
   * 更新状态筛选并回到第一页。
   */
  setStatus: (status: IItemQuery['status']) => void;
  /*
   * 更新当前页码。
   */
  setPageNo: (pageNo: number) => void;
  /*
   * 打开流转确认弹窗。
   */
  openActionDialog: (item: ISampleItem) => void;
  /*
   * 关闭流转确认弹窗。
   */
  closeActionDialog: () => void;
}

/*
 * 示例看板 domain store，避免把接口响应缓存和全局外壳状态混在一起。
 */
export const useSampleStore = create<ISampleStoreState>((set) => ({
  itemQuery: initialItemQuery,
  pendingActionItem: null,
  setKeyword(keyword) {
    set((state) => ({
      itemQuery: {
        ...state.itemQuery,
        keyword,
        pageNo: 1,
      },
    }));
  },
  setStatus(status) {
    set((state) => ({
      itemQuery: {
        ...state.itemQuery,
        status,
        pageNo: 1,
      },
    }));
  },
  setPageNo(pageNo) {
    set((state) => ({
      itemQuery: {
        ...state.itemQuery,
        pageNo,
      },
    }));
  },
  openActionDialog(item) {
    set({ pendingActionItem: item });
  },
  closeActionDialog() {
    set({ pendingActionItem: null });
  },
}));
