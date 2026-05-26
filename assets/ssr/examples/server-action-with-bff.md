# Server Action With BFF Example

本示例展示内部 UI mutation 如何经过 Server Action 调用 BFF service，并在成功后刷新对应缓存。它适用于 Next UI 内部操作，不适用于公开 REST、webhook 或移动端调用。

## Data Flow

```text
Client form
  -> Server Action
  -> src/bff/actions/cartAction.ts
  -> src/bff/services/cartService.ts
  -> src/bff/gateway/requestBackend.ts
  -> backend or Prism
  -> revalidateTag / revalidatePath
```

## Action Facade

```ts
import 'server-only';

import { createRequestContext } from '@/bff/shared/requestContext';
import { updateCartQuantity } from '@/bff/services/cartService';

/**
 * 购物车数量变更输入。
 */
export interface IUpdateCartQuantityInput {
  /**
   * 购物车行项目 id。
   */
  lineId: string;
  /**
   * 目标数量，必须是正整数。
   */
  quantity: number;
}

/**
 * 将 FormData 转成 BFF service 可消费的输入。
 */
export function parseUpdateCartQuantityInput(formData: FormData): IUpdateCartQuantityInput {
  const lineId = String(formData.get('lineId') || '');
  const quantity = Number(formData.get('quantity'));

  if (!lineId) {
    throw new Error('cart.lineId.required');
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('cart.quantity.invalid');
  }

  return { lineId, quantity };
}

/**
 * 执行购物车数量变更，供 Server Action 调用。
 */
export async function updateCartQuantityFromAction(formData: FormData): Promise<string> {
  const context = await createRequestContext();
  const input = parseUpdateCartQuantityInput(formData);

  await updateCartQuantity(input, context);

  return context.requestId;
}
```

## Server Action

```ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { updateCartQuantityFromAction } from '@/bff/actions/cartAction';
import { resolveActionErrorMessage } from '@/bff/shared/actionError';

/**
 * Server Action 返回给表单的结果。
 */
export interface ICartActionState {
  /**
   * 当前操作是否成功。
   */
  ok: boolean;
  /**
   * 用户可见的错误文案或后端 codeMsg。
   */
  message?: string;
  /**
   * 请求链路 id。
   */
  requestId?: string;
}

/**
 * 提交购物车数量变更，并刷新购物车相关缓存。
 */
export async function submitCartQuantityAction(
  _previousState: ICartActionState,
  formData: FormData,
): Promise<ICartActionState> {
  try {
    const requestId = await updateCartQuantityFromAction(formData);

    revalidateTag('cart.summary');
    revalidatePath('/cart');

    return { ok: true, requestId };
  } catch (error) {
    unstable_rethrow(error);

    return {
      ok: false,
      message: resolveActionErrorMessage(error),
    };
  }
}
```

## Review Points

- `'use server'` 只放在 Server Action 入口，不把整个 BFF service 变成 action 文件。
- `FormData` 做了运行时校验，不只依赖 TypeScript 类型。
- action 返回值可序列化，不包含 token、cookie、raw DTO 或 Error 对象。
- mutation 成功后刷新了明确 path/tag。
- 如果同一能力需要公开 HTTP 契约，应另建 Route Handler，并复用 BFF service，而不是让外部调用 Server Action。
