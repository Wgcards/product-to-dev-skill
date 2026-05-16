/*
 * 将数量转换为带前导零的展示形式，用于保持流程节点宽度稳定。
 */
export function formatStageCount(count: number): string {
  return count.toString().padStart(2, '0');
}
