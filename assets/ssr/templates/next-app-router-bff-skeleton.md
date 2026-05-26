# Next App Router BFF Skeleton Template

本模板用于新建或改造 Next.js App Router SSR/BFF 项目时复制目录边界和核心接线。它不是完整脚手架；落地时应结合目标项目的 Next 主版本、UI 体系、日志、配置、鉴权和 OpenAPI 契约补齐实现。

## 适用场景

- C 端公开页、商品/分类/搜索/内容详情、营销承接页、可分享页面。
- 需要服务端预取、SEO metadata、Open Graph、sitemap/robots 或 BFF gateway 的页面。
- 既有 Next.js App Router 项目需要收口后端访问、Prism mock、DTO 和 adapter 边界。

## 目录骨架

```text
src/
  app/
    (public)/
      products/[slug]/page.tsx
    api/
      products/[slug]/route.ts
  bff/
    adapter/
      productAdapter.ts
    dto/
      product.ts
    gateway/
      endpointRegistry.ts
      requestBackend.ts
    routes/
      productRoute.ts
    services/
      productService.ts
    shared/
      bffError.ts
      requestContext.ts
  features/
    product/
      components/ProductDetailClient.tsx
      types/productView.ts
  shared/
    ui/
  types/
    dto/
mock/
  openapi.yaml
  components/
  examples/
```

## 必守边界

- `src/app` 只做路由入口、metadata、loading/error/not-found、Route Handler 或 Server Action 入口。
- Server Component 读取内部业务数据时直接调用 `src/bff/services/**` 或项目 server facade，不通过 `fetch('/api/...')` 自调同站 Route Handler。
- `src/bff/gateway` 是唯一真实出站请求层；service、route、action、component 都不能拼后端 base URL。
- `src/bff/adapter` 只做后端 DTO 到前端 view model 的转换，不读 cookie/header/env，不发请求。
- Client Component 不能导入 `src/bff/**`，也不能接收 token、cookie、后端 raw DTO 或不可序列化 props。
- 每个实现中的 endpoint 都要对应 endpoint id、OpenAPI operationId、DTO、adapter、mock example 和 API 文档。

## Endpoint Registry

```ts
/**
 * 后端契约的稳定 endpoint id。
 * 业务代码只引用这些 id，避免在 service 中散落 method/path/cache 细节。
 */
export type TEndpointId = 'product.detail.get';

/**
 * 单个后端 endpoint 的调用配置。
 */
export interface IEndpointConfig {
  /**
   * 后端 HTTP 方法。
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /**
   * 后端路径模板，动态段由 gateway 统一替换。
   */
  path: string;
  /**
   * OpenAPI 中对应的 operationId。
   */
  operationId: string;
  /**
   * 缓存策略归属；登录态或权限态数据默认 no-store。
   */
  cache: 'public-revalidate' | 'private-no-store';
}

/**
 * SSR/BFF 项目的 endpoint 注册表。
 */
export const endpointRegistry: Record<TEndpointId, IEndpointConfig> = {
  'product.detail.get': {
    method: 'GET',
    path: '/api/v1/products/{slug}',
    operationId: 'getProductDetail',
    cache: 'public-revalidate',
  },
};
```

## Gateway Template

```ts
import 'server-only';

import { getServerRuntimeConfig } from '@/bff/shared/runtimeConfig';

import { endpointRegistry, type TEndpointId } from './endpointRegistry';

/**
 * BFF 出站请求的上下文。
 */
export interface IRequestContext {
  /**
   * 当前请求链路 id，用于串联 Route Handler、BFF gateway 和上游日志。
   */
  requestId: string;
  /**
   * 当前语言，用于透传给后端或 Prism mock。
   */
  locale: string;
  /**
   * 服务端会话换出的后端授权头；不得传给 Client Component。
   */
  authorization?: string;
}

/**
 * 后端统一响应 wrapper。
 */
export interface IBackendEnvelope<TData> {
  /**
   * 成功时使用项目约定的业务 code，例如 "200"。
   */
  code: string;
  /**
   * 后端可展示消息；错误时可作为 locale-aware 后端文案来源。
   */
  codeMsg: string;
  /**
   * 业务数据载荷。
   */
  data: TData;
}

/**
 * 统一执行 BFF 出站请求，并校验后端 wrapper。
 */
export async function requestBackend<TData>(
  endpointId: TEndpointId,
  context: IRequestContext,
  pathParams: Record<string, string> = {},
): Promise<IBackendEnvelope<TData>> {
  const endpoint = endpointRegistry[endpointId];
  const path = Object.entries(pathParams).reduce(
    (currentPath, [key, value]) => currentPath.replace(`{${key}}`, encodeURIComponent(value)),
    endpoint.path,
  );
  const config = getServerRuntimeConfig();

  const response = await fetch(`${config.backendBaseUrl}${path}`, {
    method: endpoint.method,
    headers: {
      'Accept': 'application/json',
      'X-Request-Id': context.requestId,
      'Accept-Language': context.locale,
      ...(context.authorization ? { authorization: context.authorization } : {}),
    },
    cache: endpoint.cache === 'private-no-store' ? 'no-store' : 'force-cache',
    next: endpoint.cache === 'public-revalidate' ? { revalidate: 300, tags: [endpointId] } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Upstream HTTP failure: ${endpointId}`);
  }

  const envelope = (await response.json()) as Partial<IBackendEnvelope<TData>>;
  if (typeof envelope.code !== 'string' || !('data' in envelope)) {
    throw new Error(`Malformed upstream wrapper: ${endpointId}`);
  }

  if (envelope.code !== '200') {
    throw new Error(envelope.codeMsg || `Business failure: ${endpointId}`);
  }

  return envelope as IBackendEnvelope<TData>;
}
```

## Service And Adapter Template

```ts
import 'server-only';

import { requestBackend, type IRequestContext } from '@/bff/gateway/requestBackend';

/**
 * 后端商品详情 DTO。
 */
export interface IProductDetailDto {
  /**
   * 后端商品主键，格式由后端契约保证。
   */
  id: string;
  /**
   * 商品 slug，用于公开详情页路由。
   */
  slug: string;
  /**
   * 商品展示标题。
   */
  title: string;
  /**
   * 最后更新时间，ISO 8601 字符串。
   */
  updatedAt: string;
}

/**
 * 商品详情页需要的最小 view model。
 */
export interface IProductDetailView {
  /**
   * 页面展示标题。
   */
  title: string;
  /**
   * metadata 和 canonical 使用的 slug。
   */
  slug: string;
  /**
   * 已序列化的更新时间，允许传给 Client Component。
   */
  updatedAtLabel: string;
}

/**
 * 将后端商品 DTO 映射为页面稳定 view model。
 */
export function toProductDetailView(dto: IProductDetailDto): IProductDetailView {
  return {
    title: dto.title,
    slug: dto.slug,
    updatedAtLabel: dto.updatedAt,
  };
}

/**
 * 读取商品详情，供 Server Component 或 Route Handler facade 使用。
 */
export async function getProductDetail(
  slug: string,
  context: IRequestContext,
): Promise<IProductDetailView> {
  const envelope = await requestBackend<IProductDetailDto>('product.detail.get', context, { slug });

  return toProductDetailView(envelope.data);
}
```

## Page Template

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getProductDetail } from '@/bff/services/productService';
import { createRequestContext } from '@/bff/shared/requestContext';
import { ProductDetailClient } from '@/features/product/components/ProductDetailClient';

/**
 * 商品详情页参数。
 */
interface IProductPageProps {
  /**
   * Next 15+ / 16 的动态路由参数。
   */
  params: Promise<{ slug: string }>;
}

/**
 * 生成商品详情页 metadata，并复用 BFF read 能力。
 */
export async function generateMetadata({ params }: IProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await createRequestContext();
  const product = await getProductDetail(slug, context);

  return {
    title: product.title,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

/**
 * 商品详情 SSR 页面入口。
 */
export default async function ProductPage({ params }: IProductPageProps) {
  const { slug } = await params;
  const context = await createRequestContext();
  const product = await getProductDetail(slug, context).catch(() => null);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
```

## Handoff Checklist

- 通用 quality tooling 已接入或标注兼容缺口：ESLint、Prettier、EditorConfig、Commitlint、Husky/lint-staged、pnpm/package manager、`check` 脚本、alias 配置和边界扫描。
- 手写代码已自检 comment 与 TS 命名：函数、组件、Route Handler、Server Action、BFF gateway/service/adapter、DTO 字段、复杂分支都有中文注释，interface 使用 `I` 前缀，type alias 使用 `T` 前缀。
- 应用代码跨目录 import 使用 alias，同目录才使用 `./`，没有用父级相对路径绕过 `src/app`、`src/bff`、`src/features`、`src/shared` 边界。
- Next 主版本已声明；Next 16+ 使用 `proxy.ts`，仍需 Edge runtime 时记录 `middleware.ts` 兼容例外。
- 公开页、登录态页、Route Handler 和 Server Action 的 rendering/cache 策略已声明。
- 每个 endpoint 已映射到 endpoint id、OpenAPI operationId、DTO、adapter、mock example 和 API 文档。
- 私有数据使用 `no-store` 或等价隔离；公开缓存包含 tag/path revalidation 策略。
- Client Component 没有导入 `src/bff/**`、server env、Node API 或后端 SDK。
- Server Component 没有通过同站 `/api/**` 回环读取内部数据。
- gateway 有 request id、locale、authorization、timeout/错误归一、wrapper 校验和脱敏日志。
- mutation 使用 Server Action；公开 HTTP、webhook、移动端或第三方调用使用 Route Handler。
- 已运行窄 `typecheck`、`lint`/边界扫描、`next build`、OpenAPI/Prism mock smoke 和必要浏览器检查。
