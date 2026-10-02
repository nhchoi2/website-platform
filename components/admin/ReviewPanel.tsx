'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { post } from '@/lib/client';
import { contentDiff, statusLabels } from '@/lib/content';
import type { Domain, SiteDetail } from '@/lib/types';
function printable(value: unknown) {
  return value === null
    ? '없음'
    : typeof value === 'string'
      ? value || '비어 있음'
      : JSON.stringify(value, null, 2);
}
export function ReviewPanel({ detail }: { detail: SiteDetail }) {
  const { site, revisions, submissions, publications } = detail;
  const pending = submissions.find((s) => s.status === 'pending');
  const [selected, setSelected] = useState(
    pending?.revision_id || submissions[0]?.revision_id || 'draft',
  );
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [width, setWidth] = useState('desktop');
  const [tab, setTab] = useState('review');
  const [domains, setDomains] = useState(detail.domains);
  const [domain, setDomain] = useState({ hostname: '', status: 'pending', expires: '', notes: '' });
  const requestKey = useRef<Record<string, string>>({});
  const operationKey = (name: string) => (requestKey.current[name] ??= crypto.randomUUID());
  const current = revisions.find((r) => r.id === site.published_revision);
  const selectedRevision = revisions.find((r) => r.id === selected);
  const selectedContent = selectedRevision?.content || site.draft;
  const sub = submissions.find((s) => s.revision_id === selected);
  const diff = contentDiff(current?.content || null, selectedContent);
  async function review(action: 'approve' | 'changes') {
    if (!sub || !selectedRevision) return;
    if (
      action === 'approve' &&
      !confirm(`지금 보고 있는 제출본 v${selectedRevision.draft_version}을 공개할까요?`)
    )
      return;
    setBusy(true);
    setError('');
    try {
      await post(`/api/admin/sites/${site.id}/review`, {
        submission: sub.id,
        revision: selectedRevision.id,
        action,
        feedback,
        key: operationKey(`${sub.id}:${action}`),
      });
      location.reload();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <header className="workspace-header">
        <div>
          <p className="breadcrumb">
            <Link href="/admin">운영자 관리</Link>
            <span>/</span>사이트 검수
          </p>
          <h1>{site.draft.name || site.slug}</h1>
          <small>{detail.owner_email}</small>
        </div>
        <div className="header-actions">
          <a className="button secondary" href={`/api/admin/sites/${site.id}/export`}>
            데이터·이미지 내보내기 ↓
          </a>
          {site.published_revision && (
            <a
              className="button secondary"
              href={`/s/${site.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              공개본 ↗
            </a>
          )}
        </div>
      </header>
      <div className="page-body">
        <nav className="tabs">
          {[
            ['review', '콘텐츠 검수'],
            ['history', '게시 이력·복구'],
            ['domains', '도메인 관리'],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {tab === 'review' && (
          <>
            <div className="panel review-controls">
              <label>
                확인할 버전
                <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                  <option value="draft">고객의 현재 초안 · v{site.draft_version}</option>
                  {submissions.map((s) => (
                    <option key={s.id} value={s.revision_id}>
                      제출본 v{revisions.find((r) => r.id === s.revision_id)?.draft_version} ·{' '}
                      {statusLabels[s.status]} · {new Date(s.created_at).toLocaleString('ko-KR')}
                    </option>
                  ))}
                </select>
              </label>
              <div className="segmented">
                <button aria-pressed={width === 'desktop'} onClick={() => setWidth('desktop')}>
                  데스크톱
                </button>
                <button aria-pressed={width === 'mobile'} onClick={() => setWidth('mobile')}>
                  모바일
                </button>
              </div>
              <a
                className="text-link"
                href={`/preview/${site.id}${selected === 'draft' ? '' : `?revision=${selected}`}`}
                target="_blank"
                rel="noreferrer"
              >
                새 창에서 미리보기 ↗
              </a>
            </div>
            <div className={`admin-preview ${width}`}>
              <iframe
                title="검수할 버전 미리보기"
                src={`/preview/${site.id}?embed=1${selected === 'draft' ? '' : `&revision=${selected}`}`}
              />
            </div>
            <section className="panel diff-panel">
              <div className="section-title">
                <div>
                  <p className="eyebrow">CHANGES</p>
                  <h2>현재 공개본과 비교</h2>
                </div>
                <span className="pill">{diff.length}개 항목 변경</span>
              </div>
              <p className="help">
                왼쪽은 현재 공개본, 오른쪽은 위에서 선택한 버전입니다. 사진과 메뉴의 배열 순서도
                비교합니다.
              </p>
              {diff.length ? (
                diff.map((item) => (
                  <details
                    key={item.key}
                    className="diff-item"
                    open={typeof item.after === 'string'}
                  >
                    <summary>{item.label}</summary>
                    <div className="diff-columns">
                      <div>
                        <small>현재 공개본</small>
                        <pre>{printable(item.before)}</pre>
                      </div>
                      <div>
                        <small>선택한 버전</small>
                        <pre>{printable(item.after)}</pre>
                      </div>
                    </div>
                  </details>
                ))
              ) : (
                <p>공개본과 변경된 내용이 없습니다.</p>
              )}
            </section>
            <section className="panel approval-panel">
              <h2>검수 결과</h2>
              {sub?.status === 'pending' ? (
                <>
                  <p className="notice">
                    승인하면 선택한 제출본 v{selectedRevision?.draft_version}이 즉시 공개됩니다.
                    고객의 최신 초안은 게시하지 않습니다.
                  </p>
                  <label>
                    보완 의견
                    <textarea
                      rows={4}
                      value={feedback}
                      maxLength={4000}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="어떤 내용을 수정해야 하는지 구체적으로 적어주세요."
                    />
                  </label>
                  <div className="header-actions">
                    <button
                      className="button secondary"
                      disabled={busy || !feedback.trim()}
                      onClick={() => review('changes')}
                    >
                      보완 요청
                    </button>
                    <button
                      className="button primary"
                      disabled={busy}
                      onClick={() => review('approve')}
                    >
                      {busy ? '처리 중…' : '이 제출본 승인·게시'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="muted">
                  {selected === 'draft'
                    ? '초안은 승인할 수 없습니다. 고객이 제출한 검수 대기 버전을 선택하세요.'
                    : `이미 처리된 제출본입니다. ${sub?.feedback || ''}`}
                </p>
              )}
            </section>
          </>
        )}
        {tab === 'history' && (
          <section className="panel">
            <h2>게시 이력과 복구</h2>
            <p className="muted">
              이전에 공개된 버전으로 되돌려도 고객의 초안과 검수 요청은 유지됩니다.
            </p>
            {!publications.length && (
              <div className="empty-state">아직 공개한 버전이 없습니다.</div>
            )}
            {publications.map((p) => (
              <article className="publication-row" key={p.id}>
                <div>
                  <span className="pill">{p.kind === 'restore' ? '복구' : '승인·게시'}</span>
                  <h3>
                    버전 {revisions.find((r) => r.id === p.revision_id)?.draft_version}
                    {site.published_revision === p.revision_id && (
                      <span className="pill green">현재 공개본</span>
                    )}
                  </h3>
                  <time>{new Date(p.created_at).toLocaleString('ko-KR')}</time>
                  <p className="help">작업자 {p.actor_id}</p>
                </div>
                <div className="header-actions">
                  <a
                    className="button secondary small"
                    href={`/preview/${site.id}?revision=${p.revision_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    확인 ↗
                  </a>
                  <button
                    className="button secondary small"
                    disabled={busy || site.published_revision === p.revision_id}
                    onClick={async () => {
                      if (!confirm('이 버전으로 공개 홈페이지를 복구할까요?')) return;
                      setBusy(true);
                      setError('');
                      try {
                        await post(`/api/admin/sites/${site.id}/restore`, {
                          revision: p.revision_id,
                          expected: site.published_revision,
                          key: operationKey(`restore:${p.id}`),
                        });
                        location.reload();
                      } catch (err) {
                        setError((err as Error).message);
                        setBusy(false);
                      }
                    }}
                  >
                    이 버전으로 복구
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
        {tab === 'domains' && (
          <div className="domain-layout">
            <section className="panel">
              <h2>고객 소유 도메인</h2>
              <p className="muted">
                DNS와 Vercel 연결을 확인한 뒤 상태를 ‘연결 완료’로 기록하세요. 이 화면은 DNS를
                자동으로 바꾸지 않습니다.
              </p>
              <div className="notice">
                고객에게 DNS 관리 권한을 위임받으세요. 가비아 계정 비밀번호를 수집하지 않습니다.
              </div>
              {domains.map((d) => (
                <button
                  className="domain-row"
                  key={d.hostname}
                  onClick={() =>
                    setDomain({
                      hostname: d.hostname,
                      status: d.status,
                      expires: d.expires_on || '',
                      notes: d.notes,
                    })
                  }
                >
                  <strong>{d.hostname}</strong>
                  <span className={`pill ${d.status === 'connected' ? 'green' : ''}`}>
                    {{ pending: '연결 대기', connected: '연결 완료', error: '점검 필요' }[d.status]}
                  </span>
                  <small>만료일 {d.expires_on || '미기록'}</small>
                </button>
              ))}
              {!domains.length && <p className="empty-state">등록한 도메인이 없습니다.</p>}
            </section>
            <form
              className="panel"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError('');
                setMessage('');
                try {
                  const result = await post<Domain>(`/api/admin/sites/${site.id}/domain`, {
                    ...domain,
                    expires: domain.expires || null,
                  });
                  setDomains((items) => [
                    result,
                    ...items.filter((d) => d.hostname !== result.hostname),
                  ]);
                  setMessage('도메인 기록을 저장했습니다.');
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <h2>연결 정보 기록</h2>
              <label>
                도메인 주소
                <input
                  value={domain.hostname}
                  placeholder="restaurant.co.kr"
                  required
                  onChange={(e) => setDomain({ ...domain, hostname: e.target.value })}
                />
              </label>
              <label>
                연결 상태
                <select
                  value={domain.status}
                  onChange={(e) => setDomain({ ...domain, status: e.target.value })}
                >
                  <option value="pending">연결 대기</option>
                  <option value="connected">연결 완료 · DNS 및 Vercel 확인됨</option>
                  <option value="error">점검 필요</option>
                </select>
              </label>
              <label>
                도메인 만료일
                <input
                  type="date"
                  value={domain.expires}
                  onChange={(e) => setDomain({ ...domain, expires: e.target.value })}
                />
              </label>
              <label>
                관리 메모
                <textarea
                  rows={4}
                  value={domain.notes}
                  maxLength={2000}
                  placeholder="위임받은 DNS 권한, 설정한 레코드, 확인 일자"
                  onChange={(e) => setDomain({ ...domain, notes: e.target.value })}
                />
              </label>
              <button className="button primary" disabled={busy}>
                도메인 정보 저장
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setDomain({ hostname: '', status: 'pending', expires: '', notes: '' })
                }
              >
                새 도메인
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
