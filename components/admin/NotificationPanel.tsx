'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import type { NotificationJob } from '@/lib/server/notifications';
export function NotificationPanel({
  jobs,
  configured,
  local,
}: {
  jobs: NotificationJob[];
  configured: boolean;
  local: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  return (
    <div className="page-body">
      <h1>알림 발송 상태</h1>
      <p className="notice">
        {local
          ? '로컬 시연: 실제 메일은 보내지 않습니다.'
          : configured
            ? 'Resend API 연결 설정이 있습니다. 발송 성공은 각 기록으로 확인하세요.'
            : '메일 발송이 비활성화되어 있습니다. Resend 키·발신 주소·활성화 설정 후 전송할 수 있습니다.'}
      </p>
      <button
        className="button primary"
        disabled={busy || (!local && !configured)}
        onClick={async () => {
          setBusy(true);
          try {
            await post('/api/admin/notifications', {});
            router.refresh();
            setMessage('발송 대상 처리를 완료했습니다. 개별 결과를 확인하세요.');
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        대기·실패 알림 재처리
      </button>
      <p>
        중복 발송 방지를 위해 동일 발송 키를 유지합니다. 최초 시도 후 23시간이 지난 미확인 건은 자동
        재발송하지 않습니다. 공급자 로그에서 확인하세요. 실패해도 상담·제작 데이터는 유지됩니다.
      </p>
      {jobs.map((j) => (
        <article key={j.id} className="panel">
          <strong>
            {
              {
                inquiry_admin: '운영자 상담 알림',
                inquiry_receipt: '고객 접수 안내',
                project_update: '제작 진행 안내',
              }[j.kind]
            }
          </strong>
          <p>
            {j.recipient} ·{' '}
            {{
              queued: '대기',
              sending: '전송 중',
              sent: '공급자 접수 성공',
              failed: '실패',
              unknown: '결과 미확인',
              local: '로컬 시연 · 발송 안 함',
            }[j.status] || j.status}{' '}
            · 시도 {j.attempts}회
          </p>
          <small>
            {j.error} · {new Date(j.created_at).toLocaleString('ko-KR')}
          </small>
        </article>
      ))}
      <p role="status">{message}</p>
    </div>
  );
}
