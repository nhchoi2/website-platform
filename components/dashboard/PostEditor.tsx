'use client';
import { useState } from 'react';
import type { Content } from '@/lib/content';
import type { Asset } from '@/lib/types';
import type { FeatureId } from '@/templates/catalog/options';
import { post } from '@/lib/client';
export function PostEditor({
  content: c,
  update,
  siteId,
  assets,
  onAsset,
}: {
  content: Content;
  update: (c: Content | ((current: Content) => Content)) => void;
  siteId: string;
  assets: Asset[];
  onAsset: (a: Asset) => void;
}) {
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState('');
  const [openPost, setOpenPost] = useState<string | null>(null);
  const posts = c.posts || [];
  const change = (id: string, value: Record<string, unknown>) =>
    update((current) => ({
      ...current,
      posts: (current.posts || []).map((x) => (x.id === id ? { ...x, ...value } : x)),
    }));
  return (
    <>
      <h2>공지·소식 관리</h2>
      <p>
        글과 첨부파일도 초안 → 게시 요청 → 운영자 승인 순서로 공개됩니다. 삭제 후 승인하면 공개
        목록에서 제거되고 이전 공개 버전에는 남습니다.
      </p>
      <label>
        공지 검색
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <button
        className="button secondary"
        disabled={posts.length >= 50}
        onClick={() => {
          const id = crypto.randomUUID();
          setOpenPost(id);
          update((current) => ({
            ...current,
            layout: 'catalog',
            options: current.options
              ? {
                  ...current.options,
                  features: Array.from(new Set([...current.options.features, 'news' as FeatureId])),
                }
              : { pages: 1, nav: 'right', mobileNav: 'hamburger', features: ['news'], links: {} },
            posts: [
              {
                id,
                title: '',
                body: '',
                date: new Date().toLocaleDateString('sv-SE'),
                attachments: [],
              },
              ...(current.posts || []),
            ],
          }));
        }}
      >
        새 공지 작성
      </button>
      {posts
        .filter((x) => (x.title + x.body).includes(search))
        .map((x) => (
          <details
            className="panel"
            key={x.id}
            open={openPost === x.id}
            onToggle={(e) => {
              if (e.currentTarget.open) setOpenPost(x.id);
              else setOpenPost((current) => (current === x.id ? null : current));
            }}
          >
            <summary>
              {x.title || '새 공지'} · {x.date}
            </summary>
            <label>
              제목
              <input
                maxLength={120}
                value={x.title}
                onChange={(e) => change(x.id, { title: e.target.value })}
              />
            </label>
            <label>
              게시 날짜
              <input
                type="date"
                value={x.date}
                onChange={(e) => change(x.id, { date: e.target.value })}
              />
            </label>
            <label>
              내용
              <textarea
                rows={8}
                maxLength={6000}
                value={x.body}
                onChange={(e) => change(x.id, { body: e.target.value })}
              />
            </label>
            <p>첨부파일: 최대 5개, JPG·PNG·WebP·PDF, 3MB 이하. 승인 전에는 비공개입니다.</p>
            {x.attachments.map((id) => (
              <div key={id} className="library-row">
                <a href={`/api/media/${id}?private=1&site=${siteId}`}>
                  {assets.find((a) => a.id === id)?.original_name || '첨부파일'} ↓
                </a>
                <button
                  className="text-button"
                  onClick={() =>
                    change(x.id, { attachments: x.attachments.filter((a) => a !== id) })
                  }
                >
                  첨부 제외
                </button>
              </div>
            ))}
            <input
              aria-label="공지 첨부파일"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={busy || x.attachments.length >= 5}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const data = new FormData();
                  data.set('file', file);
                  const asset = await post<Asset>(`/api/sites/${siteId}/upload`, data);
                  onAsset(asset);
                  update((current) => ({
                    ...current,
                    posts: (current.posts || []).map((p) =>
                      p.id === x.id ? { ...p, attachments: [...p.attachments, asset.id] } : p,
                    ),
                  }));
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
            <button
              className="text-button"
              onClick={() => {
                if (confirm('초안에서 이 공지를 삭제할까요? 승인 전 공개본은 유지됩니다.'))
                  update({ ...c, posts: posts.filter((t) => t.id !== x.id) });
              }}
            >
              공지 삭제
            </button>
          </details>
        ))}
      <p role="status">{message}</p>
    </>
  );
}
