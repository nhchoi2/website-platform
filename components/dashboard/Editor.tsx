'use client';
import { useRef, useState } from 'react';
import { post } from '@/lib/client';
import { statusLabels, type Content } from '@/lib/content';
import type { Asset, SiteDetail, Submission } from '@/lib/types';
import { useDraft } from './useDraft';
import { PhotoEditor } from './PhotoEditor';
import { AdditionalEditor } from './AdditionalEditor';
import { PostEditor } from './PostEditor';
import { findTemplate } from '@/templates/catalog/catalog';
import { MenuEditor } from './MenuEditor';
export function Editor({ detail, admin = false }: { detail: SiteDetail; admin?: boolean }) {
  const { site } = detail;
  const draft = useDraft(site);
  const [tab, setTab] = useState('info');
  const [assets, setAssets] = useState(detail.assets);
  const [submissions, setSubmissions] = useState(detail.submissions);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<'mobile' | 'desktop' | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const key = useRef<string | null>(null);
  const pending = submissions.find((s) => s.status === 'pending');
  const latest = submissions[0];
  const { content, update } = draft;
  const field = (name: keyof Content, value: unknown) =>
    update((current) => ({ ...current, [name]: value }));
  const addAsset = (asset: Asset) => setAssets((current) => [asset, ...current]);
  async function submit() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const version = await draft.save();
      key.current ??= crypto.randomUUID();
      const result = await post<Submission>(`/api/sites/${site.id}/submit`, {
        version,
        key: key.current,
      });
      setSubmissions((current) => [result, ...current.filter((s) => s.id !== result.id)]);
      key.current = null;
      setMessage(
        result.status === 'pending'
          ? '게시 요청을 보냈습니다. 이후 수정은 새 초안에 저장됩니다.'
          : '이 버전은 이미 처리되었습니다. 내용을 수정하고 다시 요청하세요.',
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function showPreview() {
    setBusy(true);
    setError('');
    try {
      await draft.save();
      setPreviewKey((k) => k + 1);
      setPreview('desktop');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="workspace-header">
        <div>
          <p className="breadcrumb">
            {admin ? '고객 홈페이지 제작' : '내 홈페이지'} <span>/</span> 콘텐츠 편집
          </p>
          <h1>{content.name || '우리 가게 홈페이지'}</h1>
        </div>
        <div className="header-actions">
          <span role="status" className={`save-status ${draft.error ? 'failed' : ''}`}>
            <i />
            {draft.status}
          </span>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              void draft.save().catch(() => {});
            }}
          >
            임시 저장
          </button>
          <button className="button secondary" disabled={busy} onClick={showPreview}>
            미리보기 ↗
          </button>
          <button className="button primary" disabled={busy || !!pending} onClick={submit}>
            {busy ? '처리 중…' : pending ? '검수 대기 중' : '게시 요청 →'}
          </button>
        </div>
      </header>
      <div className="page-body editor-body">
        <div className="site-overview">
          <div>
            <span className={`pill ${site.published_revision ? 'green' : ''}`}>
              {site.published_revision ? '공개 중' : '공개 전'}
            </span>
            <span className="site-url">/s/{site.slug}</span>
            {site.published_revision && (
              <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer">
                공개 홈페이지 ↗
              </a>
            )}
          </div>
          <span>{findTemplate(content.template)?.name}</span>
        </div>
        <div className="workflow">
          <span className="active">
            <b>1</b> 콘텐츠 편집
          </span>
          <i />
          <span className={pending ? 'active' : ''}>
            <b>2</b> 운영자 검수
          </span>
          <i />
          <span className={site.published_revision ? 'active' : ''}>
            <b>3</b> 홈페이지 공개
          </span>
        </div>
        {draft.error && (
          <div role="alert" className="error-message">
            {draft.error}{' '}
            <button className="text-button" onClick={draft.backup}>
              현재 편집 내용 내려받기
            </button>
          </div>
        )}
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
        {latest?.status === 'changes_requested' && (
          <div className="feedback">
            <strong>보완 요청이 도착했습니다</strong>
            <p>{latest.feedback}</p>
            <small>내용을 수정한 뒤 다시 게시 요청을 보내주세요.</small>
          </div>
        )}
        {pending && (
          <div className="notice">
            제출본을 검수하고 있습니다. 계속 편집해도 제출본과 현재 공개 홈페이지는 바뀌지 않습니다.
          </div>
        )}
        <div className="editor-layout">
          <div className="editor-content">
            <nav className="tabs" aria-label="편집 항목">
              {[
                ['info', '매장 정보'],
                ['photos', '사진'],
                ['menus', '메뉴'],
                ['design', '디자인'],
                ['features', '페이지·추가 기능'],
                ['posts', '공지·소식'],
                ['history', '요청 이력'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => setTab(id)}
                >
                  {label}
                  {id === 'photos' && <small>{content.photos.length}</small>}
                  {id === 'menus' && <small>{content.menus.length}</small>}
                </button>
              ))}
            </nav>
            <section className="panel editor-panel">
              {tab === 'features' && (
                <AdditionalEditor
                  content={content}
                  update={update}
                  siteId={site.id}
                  assets={assets}
                  onAsset={addAsset}
                />
              )}
              {tab === 'posts' && (
                <PostEditor
                  content={content}
                  update={update}
                  siteId={site.id}
                  assets={assets}
                  onAsset={addAsset}
                />
              )}
              {tab === 'info' && (
                <>
                  <div className="section-title">
                    <div>
                      <p className="eyebrow">THE BASICS</p>
                      <h2>우리 가게를 알려주세요</h2>
                      <p className="muted">손님이 가장 먼저 궁금해하는 정보를 담아보세요.</p>
                    </div>
                    <span className="section-index">01</span>
                  </div>
                  <label>
                    매장 이름 <em>필수</em>
                    <input
                      value={content.name}
                      maxLength={80}
                      placeholder="예: 혜화삼겹살"
                      onChange={(e) => field('name', e.target.value)}
                    />
                  </label>
                  <label>
                    한 줄 소개
                    <input
                      value={content.tagline}
                      maxLength={160}
                      placeholder="가게를 기억하게 하는 짧은 한 문장"
                      onChange={(e) => field('tagline', e.target.value)}
                    />
                  </label>
                  <label>
                    매장 소개
                    <textarea
                      rows={6}
                      value={content.introduction}
                      maxLength={4000}
                      placeholder="가게의 시작, 재료에 대한 고집, 함께 나누고 싶은 이야기를 적어주세요."
                      onChange={(e) => field('introduction', e.target.value)}
                    />
                  </label>
                  <hr />
                  <h3>찾아오는 길과 운영 정보</h3>
                  <label>
                    주소 <em>필수</em>
                    <input
                      value={content.address}
                      maxLength={300}
                      placeholder="도로명 주소와 상세 주소"
                      onChange={(e) => field('address', e.target.value)}
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      연락처 <em>필수</em>
                      <input
                        value={content.phone}
                        maxLength={60}
                        type="tel"
                        placeholder="02-000-0000"
                        onChange={(e) => field('phone', e.target.value)}
                      />
                    </label>
                    <label>
                      영업시간
                      <textarea
                        rows={3}
                        value={content.hours}
                        maxLength={1000}
                        placeholder={'월–토 11:30–22:00\n브레이크 타임 15:00–17:00\n일요일 휴무'}
                        onChange={(e) => field('hours', e.target.value)}
                      />
                    </label>
                  </div>
                  <hr />
                  <div className="section-title">
                    <h3>외부 링크</h3>
                    <button
                      className="text-button"
                      disabled={content.links.length >= 10}
                      onClick={() =>
                        field('links', [
                          ...content.links,
                          { id: crypto.randomUUID(), label: '네이버 지도', url: 'https://' },
                        ])
                      }
                    >
                      + 링크 추가
                    </button>
                  </div>
                  <p className="help">
                    지도, SNS, 외부 예약 페이지 등 손님에게 필요한 주소를 연결하세요.
                  </p>
                  {content.links.map((link, index) => (
                    <div className="link-row" key={link.id}>
                      <label>
                        이름
                        <input
                          value={link.label}
                          maxLength={50}
                          onChange={(e) =>
                            field(
                              'links',
                              content.links.map((l) =>
                                l.id === link.id ? { ...l, label: e.target.value } : l,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        주소
                        <input
                          type="url"
                          value={link.url}
                          maxLength={1000}
                          onChange={(e) =>
                            field(
                              'links',
                              content.links.map((l) =>
                                l.id === link.id ? { ...l, url: e.target.value } : l,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        aria-label={`링크 ${index + 1} 삭제`}
                        className="text-button danger-text"
                        onClick={() =>
                          field(
                            'links',
                            content.links.filter((l) => l.id !== link.id),
                          )
                        }
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </>
              )}
              {tab === 'photos' && (
                <>
                  <div className="section-title">
                    <div>
                      <p className="eyebrow">THE ATMOSPHERE</p>
                      <h2>사진으로 전하는 첫인상</h2>
                      <p className="muted">음식과 공간의 좋은 모습을 골라주세요.</p>
                    </div>
                    <span className="section-index">02</span>
                  </div>
                  <PhotoEditor
                    siteId={site.id}
                    photos={content.photos}
                    onChange={(photos) => field('photos', photos)}
                    assets={assets.filter((a) => a.mime !== 'application/pdf')}
                    onAsset={addAsset}
                  />
                  <details className="asset-library">
                    <summary>사용하지 않는 원본 삭제</summary>
                    <p className="help">
                      먼저 사진·메뉴에서 제거하고 저장하세요. 제출본과 게시 이력에 쓰인 사진은
                      유지됩니다.
                    </p>
                    {assets.map((asset) => (
                      <div className="library-row" key={asset.id}>
                        <span>{asset.original_name}</span>
                        <button
                          className="text-button danger-text"
                          onClick={async () => {
                            if (!confirm('사용하지 않는 원본 파일을 영구 삭제할까요?')) return;
                            try {
                              await draft.save();
                              await post(`/api/sites/${site.id}/remove-asset`, {
                                assetId: asset.id,
                              });
                              setAssets((items) => items.filter((a) => a.id !== asset.id));
                            } catch (err) {
                              setError((err as Error).message);
                            }
                          }}
                        >
                          원본 삭제
                        </button>
                      </div>
                    ))}
                  </details>
                </>
              )}
              {tab === 'menus' && (
                <MenuEditor
                  siteId={site.id}
                  menus={content.menus}
                  onAsset={addAsset}
                  addMenu={() =>
                    update((c) => ({
                      ...c,
                      menus: [
                        ...c.menus,
                        {
                          id: crypto.randomUUID(),
                          name: '',
                          price: '',
                          description: '',
                          category: '',
                          imageId: null,
                          featured: false,
                        },
                      ],
                    }))
                  }
                  updateMenu={(id, patch) =>
                    update((c) => ({
                      ...c,
                      menus: c.menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
                    }))
                  }
                  removeMenu={(id) =>
                    update((c) => ({ ...c, menus: c.menus.filter((m) => m.id !== id) }))
                  }
                  moveMenu={(from, to) =>
                    update((c) => {
                      const menus = [...c.menus];
                      const [item] = menus.splice(from, 1);
                      menus.splice(to, 0, item);
                      return { ...c, menus };
                    })
                  }
                />
              )}
              {tab === 'design' && (
                <>
                  <p className="eyebrow">FINISHING TOUCHES</p>
                  <h2>가게에 어울리는 색감</h2>
                  <p className="muted">구성은 그대로, 정해진 색상 조합에서 선택하세요.</p>
                  <div className="palette-options">
                    {(
                      [
                        ['olive', '차분한 올리브', '#393a32', '#faf9f6'],
                        ['charcoal', '단정한 차콜', '#252525', '#fcfcfa'],
                        ['warm', '따뜻한 브라운', '#653c2c', '#fcf7f0'],
                      ] as const
                    ).map(([value, label, color, bg]) => (
                      <button
                        key={value}
                        aria-pressed={content.theme === value}
                        onClick={() => field('theme', value)}
                      >
                        <div style={{ background: bg, color }}>
                          <span style={{ background: color }} />
                          Aa
                        </div>
                        <strong>{label}</strong>
                        <small>{content.theme === value ? '✓ 선택됨' : '선택하기'}</small>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {tab === 'history' && (
                <>
                  <h2>게시 요청 이력</h2>
                  <p className="muted">제출한 내용은 검수가 끝날 때까지 그대로 보존됩니다.</p>
                  {!submissions.length && (
                    <div className="empty-state">아직 게시 요청이 없습니다.</div>
                  )}
                  {submissions.map((s) => (
                    <article className="history-item" key={s.id}>
                      <div>
                        <span className="pill">{statusLabels[s.status]}</span>
                        <time>{new Date(s.created_at).toLocaleString('ko-KR')}</time>
                      </div>
                      {s.feedback && <p>{s.feedback}</p>}
                      <a
                        className="text-link"
                        href={`/preview/${site.id}?revision=${s.revision_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        제출본 보기 ↗
                      </a>
                    </article>
                  ))}
                </>
              )}
            </section>
          </div>
          <aside className="editor-guide">
            <span className="guide-icon">✳</span>
            <h3>
              작은 이야기부터
              <br />
              차근차근.
            </h3>
            <p>완벽하지 않아도 괜찮습니다. 작성한 내용은 자동으로 임시 저장됩니다.</p>
            <hr />
            <strong>공개 전, 한 번 더 확인</strong>
            <p>게시 요청을 보내면 운영자가 내용을 검수합니다. 승인한 제출본만 공개됩니다.</p>
            <div className="guide-note">
              초안은 나와 운영자만
              <br />볼 수 있습니다.
            </div>
          </aside>
        </div>
      </div>
      {preview && (
        <div
          className="preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="홈페이지 미리보기"
        >
          <div className="preview-toolbar">
            <strong>비공개 미리보기</strong>
            <div>
              <button aria-pressed={preview === 'desktop'} onClick={() => setPreview('desktop')}>
                데스크톱
              </button>
              <button aria-pressed={preview === 'mobile'} onClick={() => setPreview('mobile')}>
                모바일
              </button>
            </div>
            <button className="button secondary small" onClick={() => setPreview(null)}>
              닫기 ✕
            </button>
          </div>
          <div className={`preview-canvas ${preview}`}>
            <iframe
              key={previewKey}
              title="저장한 초안 미리보기"
              src={`/preview/${site.id}?embed=1&refresh=${previewKey}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
