import 'server-only';
import { mode, appUrl } from './config';
import { serviceRpc } from './service-rpc';
export type NotificationJob = {
  id: string;
  kind: 'inquiry_admin' | 'inquiry_receipt' | 'project_update';
  inquiry_id: string | null;
  project_id: string | null;
  recipient: string;
  status: string;
  attempts: number;
  error: string;
  created_at: string;
};
export function emailConfigured() {
  return (
    mode() === 'supabase' &&
    process.env.NOTIFICATIONS_ENABLED === 'true' &&
    !!process.env.RESEND_API_KEY &&
    !!process.env.NOTIFICATION_FROM
  );
}
export async function deliverNotifications() {
  // No pretend email success when provider isn't configured. Jobs remain queued.
  if (mode() !== 'local' && !emailConfigured()) return;
  const jobs = await serviceRpc<NotificationJob[]>('claim_notifications', { p_limit: 2 });
  for (const job of jobs) {
    let status = 'unknown',
      provider: string | null = null,
      error = '';
    if (mode() === 'local') {
      status = 'local';
      error = 'LOCAL_DEMO_NO_EMAIL';
    } else {
      const link = new URL(
        job.kind === 'inquiry_admin'
          ? '/admin/inquiries'
          : job.kind === 'project_update'
            ? `/dashboard/projects/${job.project_id}`
            : '/contact',
        appUrl(),
      ).href;
      const subject =
        job.kind === 'inquiry_admin'
          ? '새 홈페이지 제작 상담이 접수되었습니다'
          : job.kind === 'project_update'
            ? '홈페이지 제작 진행 안내가 업데이트되었습니다'
            : '홈페이지 제작 상담을 접수했습니다';
      const text = `${subject}.\n${job.kind === 'inquiry_receipt' ? `접수 번호: ${job.inquiry_id}\n상담 후 입력한 연락 방법으로 안내드립니다.\n본인이 요청하지 않았다면 이 메일에 회신해 주세요.` : '로그인 후 관리 화면에서 내용을 확인해 주세요.'}\n${link}`;
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          signal: AbortSignal.timeout(10000),
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `koofy-${job.id}`,
          },
          body: JSON.stringify({
            from: process.env.NOTIFICATION_FROM,
            to: [job.recipient],
            reply_to: process.env.NOTIFICATION_REPLY_TO || 'koofylab@gmail.com',
            subject,
            text,
          }),
        });
        if (res.ok) {
          const payload = await res.json();
          if (typeof payload.id === 'string') {
            provider = payload.id;
            status = 'sent';
          } else error = 'PROVIDER_RESPONSE_UNKNOWN';
        } else {
          status = res.status >= 500 ? 'unknown' : 'failed';
          error = `PROVIDER_HTTP_${res.status}`;
        }
      } catch {
        error = 'PROVIDER_TIMEOUT_OR_NETWORK';
      }
    }
    await serviceRpc('finish_notification', {
      p_id: job.id,
      p_status: status,
      p_provider: provider,
      p_error: error,
    });
  }
}
