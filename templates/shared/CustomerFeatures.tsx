'use client';
import { useRef, useState } from 'react';
import type { Content } from '@/lib/content';
export function CustomerFeatures({
  content: c,
  siteId,
  privateImages = false,
}: {
  content: Content;
  siteId: string;
  privateImages?: boolean;
}) {
  const image = (id: string) =>
    `/api/media/${id}${privateImages ? `?private=1&site=${siteId}` : ''}`;
  const has = (id: string) => c.options?.features.some((f) => f === id);
  const [search, setSearch] = useState(''),
    [photo, setPhoto] = useState(0),
    [day, setDay] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = c.photos;
  return (
    <div className="d-content-features">
      {!has('gallery') && c.photos.length > 1 && (
        <section className="t-section">
          <h2>사진</h2>
          <div className="d-gallery">
            {c.photos.slice(1).map((p) => (
              <img key={p.id} src={image(p.assetId)} alt={p.alt} loading="lazy" />
            ))}
          </div>
        </section>
      )}
      {has('gallery') && photos.length > 0 && (
        <section className="t-section">
          <h2>사진 갤러리</h2>
          <div className="d-gallery">
            {photos.map((p, i) => (
              <button
                key={p.id}
                aria-label={`${p.alt || '사진'} 크게 보기`}
                onClick={() => {
                  setPhoto(i);
                  dialog.current?.showModal();
                }}
              >
                <img src={image(p.assetId)} alt={p.alt} loading="lazy" />
              </button>
            ))}
          </div>
          <dialog ref={dialog} className="d-gallery-dialog" aria-label="사진 크게 보기">
            <button onClick={() => dialog.current?.close()}>닫기 ×</button>
            <img
              src={image(photos[photo]?.assetId || photos[0].assetId)}
              alt={photos[photo]?.alt || ''}
            />
            <p>
              {photo + 1} / {photos.length}
            </p>
            <button onClick={() => setPhoto((photo + photos.length - 1) % photos.length)}>
              ← 이전
            </button>
            <button onClick={() => setPhoto((photo + 1) % photos.length)}>다음 →</button>
          </dialog>
        </section>
      )}
      {has('priceTable') && c.menus.length > 0 && (
        <section className="t-section">
          <h2>가격·서비스 안내</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>가격</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {c.menus.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.price}</td>
                    <td>{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {has('team') && (c.team?.length || 0) > 0 && (
        <section className="t-section">
          <h2>담당자 소개</h2>
          <div className="t-team-grid">
            {c.team?.map((t) => (
              <article key={t.id}>
                {t.imageId && <img src={image(t.imageId)} alt={t.name} />}
                <h3>{t.name}</h3>
                <p>{t.role}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {has('schedule') && (c.schedule?.length || 0) > 0 && (
        <section className="t-section">
          <h2>운영 시간표</h2>
          <div className="segmented">
            {c.schedule?.map((s, i) => (
              <button key={s.day} aria-pressed={day === i} onClick={() => setDay(i)}>
                {s.day}
              </button>
            ))}
          </div>
          <p>{c.schedule?.[day]?.hours}</p>
        </section>
      )}
      {has('process') && (c.process?.length || 0) > 0 && (
        <section className="t-section">
          <h2>이용 절차</h2>
          <ol className="d-process">
            {c.process?.map((x) => (
              <li key={x.id}>
                <h3>{x.title}</h3>
                <p>{x.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      {has('news') && (
        <section className="t-section" id="news">
          <h2>공지·소식</h2>
          <label>
            공지 검색
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          {(c.posts || [])
            .filter((x) => (x.title + ' ' + x.body).toLowerCase().includes(search.toLowerCase()))
            .map((x) => (
              <details key={x.id} className="t-news-row">
                <summary>
                  <time>{x.date}</time> {x.title}
                </summary>
                <p style={{ whiteSpace: 'pre-wrap' }}>{x.body}</p>
                {x.attachments.map((id) => (
                  <a key={id} href={image(id)} download>
                    첨부파일 다운로드 ↓
                  </a>
                ))}
              </details>
            ))}
          {!c.posts?.length && <p>등록된 소식이 없습니다.</p>}
        </section>
      )}
    </div>
  );
}
