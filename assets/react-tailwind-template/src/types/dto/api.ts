/*
 * 统一接口响应类型，与后端 { data, code, codeMsg } 结构保持一致。
 */
export interface IApiResponse<TData> {
  /*
   * 接口返回的业务数据；异常场景可能由 APIClient 兜底为空值。
   */
  data: TData;
  /*
   * 业务响应码，成功固定为 "200"。
   */
  code: string;
  /*
   * 后端业务消息，前端可直接展示。
   */
  codeMsg: string | null;
}

/*
 * 通用分页请求参数，后续可替换为项目已有分页 DTO。
 */
export interface IPageRequest {
  /*
   * 当前页码，从 1 开始。
   */
  pageNo: number;
  /*
   * 每页记录数。
   */
  pageSize: number;
}

/*
 * 通用分页响应结构，接真实接口时可映射到项目后端分页模型。
 */
export interface IPageResponse<TRecord> {
  /*
   * 当前页记录集合。
   */
  records: TRecord[];
  /*
   * 当前页码，从 1 开始。
   */
  pageNo: number;
  /*
   * 每页记录数。
   */
  pageSize: number;
  /*
   * 满足筛选条件的总记录数。
   */
  total: number;
}
