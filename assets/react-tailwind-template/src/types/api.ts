/*
 * 统一接口响应类型，与 GX 后端文档中的 { data, code, codeMsg } 结构保持一致。
 */
export interface IApiResponse<TData> {
  data: TData;
  code: string;
  codeMsg: string | null;
}

/*
 * 通用分页请求参数，后续可替换为项目已有分页 DTO。
 */
export interface IPageRequest {
  pageNo: number;
  pageSize: number;
}

/*
 * 通用分页响应结构，接真实接口时可映射到 JaPageRespDTO 等项目模型。
 */
export interface IPageResponse<TRecord> {
  records: TRecord[];
  pageNo: number;
  pageSize: number;
  total: number;
}
