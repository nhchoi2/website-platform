import 'server-only';
import { ZodError } from 'zod';
import { currentUser } from './auth';
import { isPlatformHost } from '../hosts';
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin');
  if (!isPlatformHost(host) || !origin || new URL(origin).host !== host)
    throw new HttpError(403, '허용되지 않은 요청입니다.');
}
export async function apiUser(request: Request, admin = false) {
  if (!isPlatformHost(request.headers.get('host') || ''))
    throw new HttpError(404, '찾을 수 없습니다.');
  const user = await currentUser();
  if (!user) throw new HttpError(401, '로그인이 필요합니다.');
  if (admin && !user.admin) throw new HttpError(403, '운영자 권한이 필요합니다.');
  return user;
}
export async function readJson(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 200000)
    throw new HttpError(413, '내용이 너무 큽니다.');
  const text = await request.text();
  if (text.length > 200000) throw new HttpError(413, '내용이 너무 큽니다.');
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, '요청 형식이 올바르지 않습니다.');
  }
}
const messages: Record<string, [number, string]> = {
  FORBIDDEN: [403, '접근 권한이 없습니다.'],
  UNAUTHORIZED: [401, '로그인이 필요합니다.'],
  VERSION_CONFLICT: [
    409,
    '다른 화면에서 변경되었습니다. 현재 편집 내용을 복사한 뒤 새로고침하세요.',
  ],
  ALREADY_PENDING: [409, '이미 검수 중인 요청이 있습니다. 초안 편집은 계속할 수 있습니다.'],
  REQUIRED_FIELDS: [400, '매장명, 주소, 연락처를 입력한 뒤 요청하세요.'],
  ASSET_FORBIDDEN: [403, '사용할 수 없는 사진입니다.'],
  ASSET_IN_USE: [
    409,
    '초안이나 게시 이력에서 사용하는 사진은 원본을 삭제할 수 없습니다. 화면에서 제거한 뒤 저장하세요.',
  ],
  ASSET_LIMIT: [400, '매장당 보관 사진은 최대 250장입니다. 사용하지 않는 사진을 삭제하세요.'],
  FEEDBACK_REQUIRED: [400, '보완 의견을 입력하세요.'],
  DOMAIN_TAKEN: [409, '이미 다른 매장에 연결된 도메인입니다.'],
  INVALID_LOGIN: [400, '이메일 또는 비밀번호를 확인하세요.'],
  INVALID_RECOVERY: [400, '복구 링크가 만료되었거나 이미 사용되었습니다.'],
  RATE_LIMIT: [429, '요청이 많습니다. 잠시 후 다시 시도하세요.'],
  NOT_FOUND: [404, '찾을 수 없습니다.'],
  NOT_PUBLISHED: [400, '게시 이력이 있는 버전만 복구할 수 있습니다.'],
  ALREADY_REVIEWED: [409, '이미 검수된 요청입니다. 새로고침하세요.'],
  IDEMPOTENCY_CONFLICT: [409, '요청 식별자가 충돌했습니다. 새로고침하세요.'],
  INVALID_CONTENT: [400, '입력 내용을 확인하세요.'],
};
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' },
  });
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof ZodError)
    return json({ error: error.issues[0]?.message || '입력을 확인하세요.' }, 400);
  const value = error as { message?: string; code?: string };
  for (const [key, [status, message]] of Object.entries(messages))
    if (value.message?.includes(key)) return json({ error: message }, status);
  if (value.code === '23505')
    return json({ error: '이미 등록된 이메일, 주소 또는 요청입니다.' }, 409);
  console.error('Request failed:', value.code || 'unknown', value.message);
  return json(
    { error: '처리하지 못했습니다. 기존 공개본은 유지됩니다. 잠시 후 다시 시도하세요.' },
    500,
  );
}
