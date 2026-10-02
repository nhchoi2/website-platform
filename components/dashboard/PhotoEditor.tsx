'use client';
import { useRef, useState } from 'react';
import type { Asset } from '@/lib/types';
import type { Content } from '@/lib/content';
import { post } from '@/lib/client';
type Photo = Content['photos'][number];
export function PhotoEditor({
  siteId,
  photos,
  onChange,
  assets,
  onAsset,
}: {
  siteId: string;
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  assets: Asset[];
  onAsset: (asset: Asset) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const drag = useRef<number | null>(null);
  const latest = useRef(photos);
  // Keep upload results aligned with edits made while the network request runs.
  const change = (next: Photo[]) => {
    latest.current = next;
    onChange(next);
  };
  async function upload(files: FileList | File[], replace?: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    latest.current = photos;
    try {
      for (const file of Array.from(files)) {
        if (!replace && latest.current.length >= 30)
          throw new Error('매장 사진은 최대 30장입니다.');
        const form = new FormData();
        form.set('file', file);
        const asset = await post<Asset>(`/api/sites/${siteId}/upload`, form);
        onAsset(asset);
        change(
          replace
            ? latest.current.map((p) => (p.id === replace ? { ...p, assetId: asset.id } : p))
            : [...latest.current, { id: crypto.randomUUID(), assetId: asset.id, alt: '' }],
        );
        if (replace) break;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    change(next);
  }
  return (
    <div>
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
      >
        <span className="upload-symbol">↑</span>
        <strong>{busy ? '사진을 업로드하고 있습니다…' : '사진을 끌어다 놓으세요'}</strong>
        <span>JPG, PNG, WebP · 한 장당 3MB · 최대 30장</span>
        <label className="button secondary">
          사진 선택
          <input
            className="sr-only"
            aria-label="매장 사진 업로드"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={(e) => {
              if (e.target.files) void upload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <p className="help">
        첫 번째 사진이 메인 사진입니다. 끌어서 순서를 바꾸거나 화살표 버튼을 사용하세요.
      </p>
      <div className="photo-grid">
        {photos.map((p, i) => (
          <article
            className="photo-card"
            key={p.id}
            draggable={!busy}
            onDragStart={() => {
              drag.current = i;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (drag.current !== null) move(drag.current, i);
              drag.current = null;
            }}
          >
            <div className="photo-image">
              <img
                src={`/api/media/${p.assetId}?private=1&site=${siteId}`}
                alt={p.alt || `매장 사진 ${i + 1}`}
              />
              {i === 0 && <span className="pill green">메인 사진</span>}
            </div>
            <label className="sr-only" htmlFor={`alt-${p.id}`}>
              사진 {i + 1} 설명
            </label>
            <input
              id={`alt-${p.id}`}
              value={p.alt}
              placeholder="사진 설명을 적어주세요"
              maxLength={200}
              onChange={(e) =>
                change(
                  photos.map((item) =>
                    item.id === p.id ? { ...item, alt: e.target.value } : item,
                  ),
                )
              }
            />
            <div className="photo-actions">
              <button
                title="앞으로"
                aria-label={`사진 ${i + 1} 앞으로`}
                disabled={i === 0 || busy}
                onClick={() => move(i, i - 1)}
              >
                ←
              </button>
              <button
                title="뒤로"
                aria-label={`사진 ${i + 1} 뒤로`}
                disabled={i === photos.length - 1 || busy}
                onClick={() => move(i, i + 1)}
              >
                →
              </button>
              <label className="text-button">
                교체
                <input
                  className="sr-only"
                  aria-label={`사진 ${i + 1} 교체`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    if (e.target.files) void upload(e.target.files, p.id);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                className="danger-text"
                disabled={busy}
                onClick={() => change(photos.filter((item) => item.id !== p.id))}
              >
                제거
              </button>
            </div>
          </article>
        ))}
      </div>
      {assets.length > 0 && (
        <details className="asset-library">
          <summary>업로드 보관함 ({assets.length}장)</summary>
          <p className="help">
            이전에 업로드한 사진을 다시 사용할 수 있습니다. 게시 이력에 쓰인 원본은 복구를 위해
            보관합니다.
          </p>
          <div className="library-grid">
            {assets.map((a) => (
              <button
                key={a.id}
                title={a.original_name}
                disabled={photos.length >= 30 || busy}
                onClick={() =>
                  change([...photos, { id: crypto.randomUUID(), assetId: a.id, alt: '' }])
                }
              >
                <img src={`/api/media/${a.id}?private=1&site=${siteId}`} alt={a.original_name} />
                <span>추가 +</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
