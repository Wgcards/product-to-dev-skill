# Server Action Mutation Template

本模板用于 Next.js App Router 内部 UI mutation。只要 mutation 需要被外部系统、移动端、第三方或公开 REST 调用，就不要使用 Server Action，改用 Route Handler。

## 适用场景

- 当前 Next UI 内部表单提交、状态变更、收藏、加入购物车、资料更新。
- 需要服务端鉴权、输入校验、调用 BFF service、成功后 `revalidatePath` 或 `revalidateTag`。
- 不需要公开 HTTP 契约，不需要由第三方或移动端直接调用。

## Server Action File

```ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { resolveActionErrorMessage } from '@/bff/shared/actionError';
import { createRequestContext } from '@/bff/shared/requestContext';
import { updateCartQuantity } from '@/bff/services/cartService';

/**
 * Server Action 的稳定返回结果。
 */
export interface IActionResult<TData = null> {
  /**
   * 当前操作是否成功。
   */
  ok: boolean;
  /**
   * 成功时返回给 UI 的最小可序列化数据。
   */
  data?: TData;
  /**
   * 失败时展示的 locale-aware 错误文案或后端 codeMsg。
   */
  message?: string;
  /**
   * 当前请求链路 id，便于用户反馈后排查日志。
   */
  requestId?: string;
}

/**
 * 购物车数量变更表单字段。
 */
interface IUpdateCartQuantityInput {
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
 * 从 FormData 中解析并校验购物车数量变更输入。
 */
function parseUpdateCartQuantityInput(formData: FormData): IUpdateCartQuantityInput {
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
 * 提交购物车数量变更，并按影响范围刷新页面和缓存 tag。
 */
export async function submitCartQuantityAction(formData: FormData): Promise<IActionResult> {
  const context = await createRequestContext();

  try {
    const input = parseUpdateCartQuantityInput(formData);
    await updateCartQuantity(input, context);

    revalidateTag('cart.summary');
    revalidatePath('/cart');

    return { ok: true, requestId: context.requestId };
  } catch (error) {
    unstable_rethrow(error);

    return {
      ok: false,
      message: resolveActionErrorMessage(error, context.locale),
      requestId: context.requestId,
    };
  }
}
```

## Client Form

```tsx
'use client';

import { useActionState } from 'react';

import {
  submitCartQuantityAction,
  type IActionResult,
} from '@/features/cart/actions/submitCartQuantityAction';

/**
 * 购物车数量表单属性。
 */
interface ICartQuantityFormProps {
  /**
   * 购物车行项目 id。
   */
  lineId: string;
  /**
   * 当前数量，用作表单默认值。
   */
  quantity: number;
  /**
   * 已由 locale 字典解析出的表单文案，避免组件硬编码用户可见文本。
   */
  labels: {
    /**
     * 数量输入框的可访问名称。
     */
    quantity: string;
    /**
     * 默认提交按钮文案。
     */
    save: string;
    /**
     * 提交中按钮文案。
     */
    saving: string;
  };
}

/**
 * 购物车数量变更表单。
 */
export function CartQuantityForm({ labels, lineId, quantity }: ICartQuantityFormProps) {
  const [state, formAction, isPending] = useActionState<IActionResult, FormData>(
    async (_previousState, formData) => submitCartQuantityAction(formData),
    { ok: true },
  );

  return (
    <form action={formAction}>
      <input name="lineId" type="hidden" value={lineId} />
      <input
        aria-label={labels.quantity}
        defaultValue={quantity}
        min={1}
        name="quantity"
        type="number"
      />
      <button disabled={isPending} type="submit">
        {isPending ? labels.saving : labels.save}
      </button>
      {!state.ok ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
```

## 高频错误

- 不要把 Server Action 当公开 API；外部调用方、webhook、移动端和第三方集成都使用 Route Handler。
- 不要在 Client Component 中直接导入 BFF gateway、server-only helper、Node API 或 server env。
- 不要返回 token、cookie、后端 raw DTO、异常堆栈、完整邮箱/手机号或密码。
- 不要只靠 TypeScript 类型做安全边界；`FormData`、body、params 和 query 都要运行时校验。
- `redirect()`、`notFound()`、`unauthorized()`、`forbidden()` 等 Next 导航异常不能被普通 catch 吞掉；catch 中使用 `unstable_rethrow(error)` 或把导航调用放在 try-catch 外。
- mutation 成功后必须声明刷新范围：`revalidatePath`、`revalidateTag`、客户端刷新或无需刷新的原因。
- 私有数据 mutation 必须鉴权、检查资源归属，并按项目安全基线处理 CSRF/origin。
