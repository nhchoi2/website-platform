import { apiUser, sameOrigin, json, failure } from '@/lib/server/http';
import { deliverNotifications, emailConfigured } from '@/lib/server/notifications';
import { mode } from '@/lib/server/config';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await apiUser(request, true);
    if (mode() !== 'local' && !emailConfigured())
      return json({ error: '발신 주소·Resend 키와 알림 활성화 설정이 필요합니다.' }, 503);
    await deliverNotifications();
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
