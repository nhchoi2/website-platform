'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import { evidenceKinds, type Evidence, type Project } from '@/lib/projects';
export function EvidencePanel({
  items,
  projects,
  admin = false,
}: {
  items: Evidence[];
  projects: Project[];
  admin?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const key = useRef('');
  const fingerprint = useRef('');
  const [kind, setKind] = useState('cash_personal');
  const statuses = {
    requested: '발행 요청',
    issued: '발행 기록됨',
    rejected: '보완·반려',
    withdrawn: '철회',
  };
  async function update(id: string, status: string, reference = '', note = '') {
    setBusy(true);
    try {
      const res = await fetch('/api/evidence', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, reference, message: note }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      router.refresh();
      setMessage('처리 결과를 저장했습니다.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-body">
      <h1>{admin ? '증빙 요청 관리' : '증빙 발행 요청'}</h1>
      <p className="notice">
        이 화면은 현금영수증·세금계산서 발행 요청과 처리 결과를 관리합니다. 자동 발행하거나 결제를
        처리하지 않습니다. 실제 결제·발행 가능 여부는 운영자와 확인하세요.
      </p>
      {!admin && (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            const f = new FormData(e.currentTarget);
            const body = {
              project: f.get('project'),
              kind: f.get('kind'),
              identifier: f.get('identifier'),
              identifierType: f.get('identifierType'),
              name: f.get('name'),
              email: f.get('email'),
              consent: f.get('consent') === 'on',
            };
            const encoded = JSON.stringify(body);
            if (fingerprint.current !== encoded) {
              key.current = crypto.randomUUID();
              fingerprint.current = encoded;
            }
            setBusy(true);
            try {
              await post('/api/evidence', { ...body, key: key.current });
              setMessage('증빙 발행 요청을 접수했습니다. 실제 발행은 운영자가 확인합니다.');
              router.refresh();
            } catch (err) {
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy || !projects.length}>
            <label>
              제작 건
              <select name="project" required>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id.slice(0, 8)} · {p.stage}
                  </option>
                ))}
              </select>
            </label>
            <label>
              증빙 종류
              <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
                {Object.entries(evidenceKinds).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              식별번호 종류
              <select name="identifierType" key={kind}>
                {kind === 'cash_personal' ? (
                  <>
                    <option value="phone">휴대폰번호</option>
                    <option value="card">현금영수증 카드번호</option>
                  </>
                ) : (
                  <option value="business">사업자등록번호</option>
                )}
              </select>
            </label>
            <label>
              휴대폰·현금영수증 카드 번호 또는 사업자등록번호
              <input name="identifier" inputMode="numeric" required maxLength={25} />
            </label>
            <p>
              개인 소득공제는 휴대폰번호 또는 16~19자리 현금영수증 카드번호, 사업자 증빙은
              사업자등록번호 10자리입니다. 주민등록번호는 받지 않습니다.
            </p>
            <label>
              신청인 이름 또는 사업자 상호
              <input name="name" required maxLength={120} />
            </label>
            <label>
              증빙 수신 이메일
              <input name="email" type="email" required maxLength={254} />
            </label>
            <p>
              증빙 처리 목적으로 신청인·식별번호·이메일을 비공개로 수집합니다. 발행 전 철회할 수
              있으며 계약·세무 자료의 보관은 실제 발행 처리에 따라 안내합니다.
            </p>
            <label className="consent-row">
              <input type="checkbox" name="consent" required />
              증빙 요청 정보 수집·이용에 동의합니다.
            </label>
            <button className="button primary">발행 요청 접수</button>
          </fieldset>
          {!projects.length && <p>제작 상담이 고객 계정에 연결된 뒤 요청할 수 있습니다.</p>}
        </form>
      )}
      {items.map((i) => (
        <article className="panel" key={i.id}>
          <h2>
            {evidenceKinds[i.kind]} <span className="pill">{statuses[i.status]}</span>
          </h2>
          <p>
            {i.name} · {i.identifier.replace(/.(?=.{4})/g, '*')} · {i.email}
          </p>
          {admin && i.status === 'requested' && (
            <details>
              <summary>발행용 번호 확인</summary>
              <p>{i.identifier}</p>
            </details>
          )}
          <p>{i.message}</p>
          {i.reference && <p>외부 발행 번호: {i.reference}</p>}
          {i.issued_at && <time>{new Date(i.issued_at).toLocaleString('ko-KR')}</time>}
          {admin && i.status === 'requested' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void update(
                  i.id,
                  String(f.get('status')),
                  String(f.get('reference')),
                  String(f.get('message')),
                );
              }}
            >
              <fieldset disabled={busy}>
                <label>
                  처리 결과
                  <select name="status">
                    <option value="issued">외부에서 실제 발행 완료</option>
                    <option value="rejected">보완·반려</option>
                  </select>
                </label>
                <label>
                  외부 발행 번호
                  <input name="reference" maxLength={200} />
                </label>
                <label>
                  고객에게 보이는 안내
                  <textarea name="message" maxLength={2000} />
                </label>
                <button className="button secondary">처리 결과 기록</button>
              </fieldset>
            </form>
          ) : (
            !admin &&
            i.status === 'requested' && (
              <button
                disabled={busy}
                className="button secondary"
                onClick={() => {
                  if (confirm('발행 요청을 철회하고 발행용 식별번호를 삭제할까요?'))
                    void update(i.id, 'withdrawn');
                }}
              >
                요청 철회·식별정보 삭제
              </button>
            )
          )}
        </article>
      ))}
      <p role="status">{message}</p>
    </div>
  );
}
