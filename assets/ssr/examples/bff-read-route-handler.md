# BFF Read And Route Handler Example

本示例展示同一个读能力如何同时服务 Server Component 和公开 HTTP/REST 边界。页面内部读取走 BFF service；只有外部调用、浏览器显式 API、移动端或 HTTP cache 契约需要时才暴露 Route Handler。

## Data Flow

```text
Server Component
  -> src/bff/services/productService.ts
  -> src/bff/adapter/productAdapter.ts
  -> src/bff/gateway/requestBackend.ts
  -> backend or Prism

External HTTP caller
  -> src/app/api/products/[slug]/route.ts
  -> src/bff/routes/productRoute.ts
  -> src/bff/services/productService.ts
  -> src/bff/gateway/requestBackend.ts
```

## Server Component Read

```tsx
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
 * 商品详情页通过 BFF service 读取数据，不自调同站 Route Handler。
 */
export default async function ProductPage({ params }: IProductPageProps) {
  const { slug } = await params;
  const context = await createRequestContext();
  const product = await getProductDetail(slug, context);

  return <ProductDetailClient product={product} />;
}
```

## Route Handler Facade

```ts
import { unstable_rethrow } from 'next/navigation';

import { getProductDetailForHttp } from '@/bff/routes/productRoute';

/**
 * 商品详情 API 参数。
 */
interface IProductRouteContext {
  /**
   * Next 15+ / 16 的动态路由参数。
   */
  params: Promise<{ slug: string }>;
}

/**
 * 公开商品详情 HTTP 入口。
 */
export async function GET(request: Request, { params }: IProductRouteContext) {
  try {
    const { slug } = await params;
    const result = await getProductDetailForHttp(request, slug);

    return Response.json(result.body, {
      status: result.status,
      headers: result.headers,
    });
  } catch (error) {
    unstable_rethrow(error);

    return Response.json(
      { code: '500', codeMsg: 'Internal server error.', data: null },
      { status: 500 },
    );
  }
}
```

## Route Facade

```ts
import 'server-only';

import { getProductDetail } from '@/bff/services/productService';
import { createRequestContextFromRequest } from '@/bff/shared/requestContext';

/**
 * Route Handler facade 的稳定返回结构。
 */
export interface IHttpResult<TBody> {
  /**
   * HTTP response body。
   */
  body: TBody;
  /**
   * HTTP 状态码。
   */
  status: number;
  /**
   * HTTP 响应头。
   */
  headers: HeadersInit;
}

/**
 * 为公开 HTTP 调用读取商品详情。
 */
export async function getProductDetailForHttp(
  request: Request,
  slug: string,
): Promise<IHttpResult<{ code: string; codeMsg: string; data: unknown }>> {
  const context = await createRequestContextFromRequest(request);
  const product = await getProductDetail(slug, context);

  return {
    body: { code: '200', codeMsg: 'OK', data: product },
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      'X-Request-Id': context.requestId,
    },
  };
}
```

## Review Points

- 页面内部读数据没有回环请求 `/api/products/[slug]`。
- Route Handler 不直接导入 gateway，也不直接拼 backend URL。
- Route Handler catch 中没有吞掉 Next 导航异常。
- 公开缓存只用于不含用户态、租户态、权限态的公开数据。
- response wrapper、status、cache header 和 request id 都稳定。
