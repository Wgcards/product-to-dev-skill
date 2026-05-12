import type { IApiResponse } from "../types/api";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const envBackendToken = import.meta.env.VITE_BACKEND_TOKEN?.trim() ?? "";

/*
 * 判断是否启用真实接口；未配置 VITE_API_BASE_URL 时保持 mock 演示模式。
 */
export function isRealApiEnabled(): boolean {
  return apiBaseUrl.length > 0;
}

/*
 * 获取后端 token。真实项目优先替换为现有登录态或请求封装，不要提交真实 token。
 */
function getBackendToken(): string {
  if (typeof window === "undefined") {
    return envBackendToken;
  }

  return window.localStorage.getItem("backendToken")?.trim() || envBackendToken;
}

/*
 * 拼接接口地址，避免 base URL 和 path 的斜杠重复。
 */
function buildApiUrl(path: string): string {
  return `${apiBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/*
 * 最小真实接口请求封装，保持 { data, code, codeMsg } 结构和 authorization 请求头。
 */
export async function apiRequest<TData>(path: string, init: RequestInit = {}): Promise<IApiResponse<TData>> {
  const headers = new Headers(init.headers);
  const token = getBackendToken();

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("authorization")) {
    headers.set("authorization", token);
  }

  try {
    const response = await fetch(buildApiUrl(path), {
      ...init,
      headers,
    });
    const payload = (await response.json()) as Partial<IApiResponse<TData>>;

    if (typeof payload.code === "string" && "data" in payload) {
      return payload as IApiResponse<TData>;
    }

    return {
      data: payload as TData,
      code: response.ok ? "200" : String(response.status),
      codeMsg: response.ok ? null : response.statusText || "接口请求失败",
    };
  } catch {
    return {
      data: null as TData,
      code: "500",
      codeMsg: "接口请求失败，请检查网络或后端服务状态",
    };
  }
}
