import { ZodError } from 'zod';
import { inquirySchema } from '@/lib/inquiries';
import { submitInquiry, inquiryEnabled } from '@/lib/server/inquiries';
import { sameOrigin, readJson, json, HttpError, failure } from '@/lib/server/http';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!inquiryEnabled())
      throw new HttpError(
        503,
        '온라인 상담 접수를 준비 중입니다. koofylab@gmail.com으로 문의해 주세요.',
      );
    const input = inquirySchema.parse(await readJson(request));
    if (input.website) throw new HttpError(400, '요청을 확인해 주세요.');
    const { currentUser } = await import('@/lib/server/auth');
    const user = await currentUser();
    const id = await submitInquiry(input, user && !user.admin ? user.id : null);
    const { after } = await import('next/server');
    const { deliverNotifications } = await import('@/lib/server/notifications');
    after(async () => {
      try {
        await deliverNotifications();
      } catch {
        /* persisted jobs are retryable */
      }
    });
    return json({ id });
  } catch (error) {
    // Do not log contact information or submitted SQL argument values.
    if (error instanceof Error && error.message === 'INQUIRY_UNAVAILABLE')
      return json(
        { error: '접수하지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.' },
        503,
      );
    if (error instanceof Error && error.message === 'RATE_LIMIT')
      return json(
        { error: '상담 요청이 많습니다. 잠시 후 다시 접수하거나 이메일로 문의해 주세요.' },
        429,
      );
    if (
      error instanceof HttpError ||
      error instanceof ZodError ||
      (error instanceof Error && error.message.includes('IDEMPOTENCY_CONFLICT'))
    )
      return failure(error);
    return json(
      { error: '접수하지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.' },
      503,
    );
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const { apiUser } = await import('@/lib/server/http');
    const user = await apiUser(request, true);
    const { z } = await import('zod');
    const input = z
      .object({
        id: z.string().uuid(),
        status: z.enum(['new', 'contacted', 'closed']),
        notes: z.string().max(3000),
      })
      .parse(await readJson(request));
    const { rpc } = await import('@/lib/server/data');
    await rpc(user, 'update_inquiry', {
      p_id: input.id,
      p_status: input.status,
      p_notes: input.notes,
    });
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const { apiUser } = await import('@/lib/server/http');
    const user = await apiUser(request, true);
    const { z } = await import('zod');
    const input = z.object({ id: z.string().uuid() }).parse(await readJson(request));
    const { rpc } = await import('@/lib/server/data');
    await rpc(user, 'delete_inquiry', { p_id: input.id });
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
