'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function ProposalSharing({ id, revoked }: { id: string; revoked: boolean }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  const [stopped, setStopped] = useState(revoked);
  const router = useRouter();
  async function update(action: 'resume' | 'revoke') {
    if (pending) return;
    setPending(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/proposals/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!response.ok) throw new Error('공유 상태를 변경하지 못했습니다.');
      setStopped(action === 'revoke');
      setConfirmStop(false);
      router.refresh();
      setMessage(
        action === 'resume'
          ? '공유를 다시 시작했습니다. 이전에 보낸 같은 링크로 시안을 볼 수 있습니다.'
          : '공유 링크를 중지했습니다. 이미 발급된 사진 주소는 최대 10분 후 만료됩니다.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '처리하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <p className="muted">
        공유 중지 시 고객이 비교 화면과 세 시안에 접근할 수 없습니다. 자료는 삭제되지 않으며 실제
        홈페이지에는 영향을 주지 않습니다.
      </p>
      {confirmStop ? (
        <div role="group" aria-label="시안 공유 중지 확인">
          <p>고객에게 보낸 시안 링크를 중지할까요? 나중에 같은 링크로 다시 시작할 수 있습니다.</p>
          <button
            type="button"
            className="button secondary"
            disabled={pending}
            onClick={() => setConfirmStop(false)}
          >
            취소
          </button>
          <button
            type="button"
            className="button"
            disabled={pending}
            onClick={() => update('revoke')}
          >
            {pending ? '처리 중…' : '공유 중지 확인'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="button secondary"
          disabled={pending}
          onClick={() => (stopped ? update('resume') : setConfirmStop(true))}
        >
          {pending ? '처리 중…' : stopped ? '공유 다시 시작' : '시안 링크 공유 중지'}
        </button>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
