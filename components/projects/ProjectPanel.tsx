'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import { pricing } from '@/components/marketing/content';
import { stages, type ProjectDetail, type ProjectFile } from '@/lib/projects';
export function ProjectPanel({
  detail,
  admin = false,
}: {
  detail: ProjectDetail;
  admin?: boolean;
}) {
  const router = useRouter();
  const [project, setProject] = useState(detail.project),
    [files, setFiles] = useState(detail.files),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const [stage, setStage] = useState(project.stage),
    [note, setNote] = useState(project.message),
    [quote, setQuote] = useState({
      setup: project.quote.setup ?? pricing.setup,
      monthly: project.quote.monthly ?? pricing.monthly,
      extras: project.quote.extras ?? 0,
      scope: project.quote.scope ?? '',
    });
  const [consent, setConsent] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function task(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await action();
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '처리하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }
  async function upload(selected: FileList | null) {
    if (!selected || !consent) {
      setMessage('자료 제공 안내를 확인해 주세요.');
      return;
    }
    await task(async () => {
      for (const file of Array.from(selected)) {
        const data = new FormData();
        data.set('file', file);
        data.set('consent', 'true');
        const result = await post<ProjectFile>(`/api/projects/${project.id}/upload`, data);
        setFiles((xs) => [result, ...xs]);
      }
      setMessage('자료를 비공개로 전달했습니다.');
    });
    if (input.current) input.current.value = '';
  }
  return (
    <div className="page-body">
      <p className="breadcrumb">
        <Link href={admin ? '/admin/projects' : '/dashboard/projects'}>제작 진행</Link> /{' '}
        {project.id.slice(0, 8)}
      </p>
      <h1>{stages[project.stage]}</h1>
      <ol className="project-steps">
        {Object.entries(stages)
          .filter(([id]) => id !== 'closed')
          .map(([id, label]) => (
            <li key={id} aria-current={project.stage === id ? 'step' : undefined}>
              {label}
            </li>
          ))}
      </ol>
      <section className="panel">
        <h2>최근 안내</h2>
        <p className="inquiry-message">
          {project.message || '운영자가 상담 내용을 확인하고 있습니다.'}
        </p>
        {project.site_id && (
          <Link
            className="button secondary"
            href={admin ? `/admin/${project.site_id}/edit` : '/dashboard'}
          >
            {admin ? '홈페이지 제작·편집' : '내 홈페이지 관리'} →
          </Link>
        )}
      </section>
      {Object.keys(project.quote).length > 0 && (
        <section className="panel">
          <h2>제작·관리 견적</h2>
          <dl>
            <dt>기본 제작</dt>
            <dd>{project.quote.setup?.toLocaleString()}원</dd>
            <dt>추가 제작</dt>
            <dd>{project.quote.extras?.toLocaleString()}원</dd>
            <dt>월 관리</dt>
            <dd>{project.quote.monthly?.toLocaleString()}원</dd>
          </dl>
          <p>부가세 포함 · 도메인 비용 별도</p>
          <p className="inquiry-message">{project.quote.scope}</p>
          <p>견적 확인은 내용을 읽었다는 기록이며 계약 체결이나 결제를 의미하지 않습니다.</p>
          {project.quote_seen_at ? (
            <p className="pill green">
              고객 확인: {new Date(project.quote_seen_at).toLocaleString('ko-KR')}
            </p>
          ) : (
            !admin && (
              <button
                disabled={busy}
                className="button primary"
                onClick={() =>
                  task(async () => {
                    await post(`/api/projects/${project.id}/quote-seen`, {
                      version: project.version,
                    });
                    setProject({ ...project, quote_seen_at: new Date().toISOString() });
                  })
                }
              >
                견적 내용을 확인했습니다
              </button>
            )
          )}
        </section>
      )}
      {admin && (
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            void task(async () => {
              const result = await post<typeof project>(`/api/projects/${project.id}/update`, {
                version: project.version,
                stage,
                message: note,
                quote,
              });
              setProject(result);
              setMessage('고객에게 공개되는 진행 안내를 저장했습니다.');
            });
          }}
        >
          <h2>진행·견적 안내 작성</h2>
          <fieldset disabled={busy}>
            <label>
              제작 단계
              <select value={stage} onChange={(e) => setStage(e.target.value as typeof stage)}>
                {Object.entries(stages).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              고객에게 보이는 안내
              <textarea
                maxLength={3000}
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="form-grid">
              {(['setup', 'extras', 'monthly'] as const).map((k) => (
                <label key={k}>
                  {
                    { setup: '기본 제작 금액', extras: '추가 제작 금액', monthly: '월 관리 금액' }[
                      k
                    ]
                  }
                  <input
                    type="number"
                    min={0}
                    max={100000000}
                    required
                    value={quote[k]}
                    onChange={(e) => setQuote({ ...quote, [k]: Number(e.target.value) })}
                  />
                </label>
              ))}
            </div>
            <label>
              견적 범위·별도 비용
              <textarea
                rows={4}
                required
                maxLength={3000}
                value={quote.scope}
                onChange={(e) => setQuote({ ...quote, scope: e.target.value })}
              />
            </label>
            <button className="button primary">진행 안내·견적 저장</button>
          </fieldset>
        </form>
      )}
      <section className="panel">
        <h2>제작 자료 전달</h2>
        <p>
          JPG·PNG·WebP·PDF, 파일당 3MB 이하, 최대 50개. 사진은 WebP로 변환됩니다. 고객과 운영자만
          내려받을 수 있으며 홈페이지에 자동 공개되지 않습니다.
        </p>
        <p>비밀번호·주민등록번호·환자 정보 등 민감한 정보는 올리지 마세요.</p>
        <label className="consent-row">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          제작·수정 목적으로 자료를 제공하며, 사용 권한이 있는 파일임을 확인합니다.
        </label>
        <div
          className="file-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) void upload(e.dataTransfer.files);
          }}
        >
          <input
            ref={input}
            aria-label="제작 자료 업로드"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={busy || !consent}
            onChange={(e) => void upload(e.target.files)}
          />
          <p>파일을 끌어놓거나 선택하세요.</p>
        </div>
        {files.map((f) => (
          <div className="library-row" key={f.id}>
            <a href={`/api/project-files/${f.id}?project=${project.id}`}>{f.name} ↓</a>
            <small>{Math.ceil(f.bytes / 1024)}KB</small>
            <button
              type="button"
              disabled={busy}
              className="text-button"
              onClick={() => {
                if (confirm('이 비공개 자료를 삭제할까요?'))
                  void task(async () => {
                    await post(`/api/projects/${project.id}/remove-file`, { file: f.id });
                    setFiles((xs) => xs.filter((x) => x.id !== f.id));
                  });
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </section>
      <section className="panel">
        <h2>진행 이력</h2>
        {detail.events.map((e) => (
          <article className="publication-row" key={e.id}>
            <div>
              <strong>
                {stages[e.stage]} · v{e.version}
              </strong>
              <p className="inquiry-message">{e.message}</p>
              {e.quote.scope && (
                <details>
                  <summary>당시 견적</summary>
                  <p>{e.quote.scope}</p>
                  <p>
                    제작 {e.quote.setup}원 + 추가 {e.quote.extras}원 · 월 {e.quote.monthly}원
                  </p>
                </details>
              )}
              <time>{new Date(e.created_at).toLocaleString('ko-KR')}</time>
            </div>
          </article>
        ))}
      </section>
      <p role="status">{message}</p>
    </div>
  );
}
