import type { IApiResponse } from '@/types/dto/api';
import { i18n } from '@/locale/i18n';

const requestTimeoutMs = 10000;

/*
 * APIClient 请求参数，统一约束所有业务 service 的 HTTP 入口。
 */
export interface IAPIClientRequestOptions<TBody = unknown> {
  /*
   * HTTP 方法，默认使用 GET。
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /*
   * 需要序列化为 JSON 的请求体。
   */
  body?: TBody;
  /*
   * 追加请求头，authorization 会由 APIClient 自动兜底补齐。
   */
  headers?: HeadersInit;
  /*
   * 单次请求超时时间，未传时使用默认超时。
   */
  timeoutMs?: number;
}

/*
 * 判断当前环境是否优先请求 Prism mock 服务。
 */
function isMockMode(): boolean {
  return import.meta.env.VITE_API_MODE === 'mock';
}

/*
 * 根据环境变量选择 mock、dev、test 或 prod 服务地址。
 */
function getBaseUrl(): string {
  const prismBaseUrl = import.meta.env.VITE_PRISM_BASE_URL?.trim() ?? '';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

  if (isMockMode() && prismBaseUrl) {
    return prismBaseUrl;
  }

  return apiBaseUrl;
}

/*
 * 获取本地调试 token；生产项目应替换为既有登录态或请求封装。
 */
function getBackendToken(): string {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_BACKEND_TOKEN?.trim() ?? '';
  }

  return (
    window.localStorage.getItem('backendToken')?.trim() ||
    import.meta.env.VITE_BACKEND_TOKEN?.trim() ||
    ''
  );
}

/*
 * 拼接 base URL 与业务路径，避免重复斜杠导致 mock 契约匹配失败。
 */
function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/*
 * 安全读取接口响应体，兼容 204、空响应和非 JSON 错误响应。
 */
async function readResponsePayload<TData>(
  response: Response,
): Promise<Partial<IApiResponse<TData>> | TData | null> {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return rawText as TData;
  }

  return JSON.parse(rawText) as Partial<IApiResponse<TData>> | TData;
}

/*
 * 把 HTTP、业务错误和网络错误收敛成统一 { data, code, codeMsg } 响应。
 */
export async function APIClient<TData, TBody = unknown>(
  path: string,
  options: IAPIClientRequestOptions<TBody> = {},
): Promise<IApiResponse<TData>> {
  const baseUrl = getBaseUrl();
  const headers = new Headers(options.headers);
  const token = getBackendToken();
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? requestTimeoutMs,
  );

  if (!baseUrl) {
    globalThis.clearTimeout(timeoutId);
    return {
      data: null as TData,
      code: '500',
      codeMsg: i18n.t('api.error.missingBaseUrl'),
    };
  }

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('authorization')) {
    headers.set('authorization', token);
  }

  try {
    const response = await fetch(joinUrl(baseUrl, path), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    const payload = await readResponsePayload<TData>(response);

    if (payload && typeof payload === 'object' && 'code' in payload && 'data' in payload) {
      return payload as IApiResponse<TData>;
    }

    return {
      data: payload as TData,
      code: response.ok ? '200' : String(response.status),
      codeMsg: response.ok ? null : response.statusText || i18n.t('api.error.requestFailed'),
    };
  } catch (error) {
    return {
      data: null as TData,
      code: '500',
      codeMsg:
        error instanceof DOMException && error.name === 'AbortError'
          ? i18n.t('api.error.requestTimeout')
          : i18n.t('api.error.requestFailed'),
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
