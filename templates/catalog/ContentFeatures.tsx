'use client';
import { useRef, useState } from 'react';
import type { Template } from './catalog';
import type { PreviewOptions } from './options';
import { TemplateArt } from './TemplateArt';
import { templatePhotos } from './images';

// Shared optional content modules; selection persists across demo pages.
export function ContentFeatures({
  template: t,
  options,
}: {
  template: Template;
  options: PreviewOptions;
}) {
  const photos = templatePhotos(t).items;
  const has = (id: PreviewOptions['features'][number]) => options.features.includes(id);
  const [photo, setPhoto] = useState(0);
  const [day, setDay] = useState(0);
  const gallery = useRef<HTMLDialogElement>(null);
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  return (
    <div className="d-content-features">
      {has('gallery') && (
        <section id="feature-gallery" className="t-section">
          <p className="t-eyebrow">GALLERY</p>
          <h2>사진 갤러리</h2>
          <p>사진을 눌러 크게 살펴보세요. 업종에 맞춰 제작한 AI 생성 예시 이미지입니다.</p>
          <div className="d-gallery">
            {photos.map((x, i) => (
              <button
                key={x.src}
                onClick={() => {
                  setPhoto(i);
                  gallery.current?.showModal();
                }}
                aria-label={`${x.alt} 이미지 크게 보기`}
              >
                <div className={`d-gallery-image d-gallery-image-${i}`}>
                  <TemplateArt template={t} compact photoIndex={i} />
                </div>
                <span>{x.alt} ↗</span>
              </button>
            ))}
          </div>
          <dialog ref={gallery} className="d-gallery-dialog" aria-label="사진 크게 보기">
            <button className="d-dialog-close" onClick={() => gallery.current?.close()}>
              닫기 ×
            </button>
            <div className={`d-gallery-image d-gallery-image-${photo}`}>
              <TemplateArt template={t} compact photoIndex={photo} fullSize />
            </div>
            <p role="status">
              {photo + 1} / {photos.length} · {photos[photo].alt}
            </p>
            <div className="d-gallery-controls">
              <button onClick={() => setPhoto((photo + photos.length - 1) % photos.length)}>
                ← 이전
              </button>
              <button onClick={() => setPhoto((photo + 1) % photos.length)}>다음 →</button>
            </div>
          </dialog>
        </section>
      )}
      {has('priceTable') && (
        <section id="feature-priceTable" className="t-section">
          <p className="t-eyebrow">AT A GLANCE</p>
          <h2>가격·서비스 비교표</h2>
          <div className="d-price-scroll">
            <table>
              <caption>{t.serviceLabel} · 예시 가격과 설명</caption>
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col">안내</th>
                  <th scope="col">가격·문의</th>
                </tr>
              </thead>
              <tbody>
                {t.items.map((x) => (
                  <tr key={x.name}>
                    <th scope="row">{x.name}</th>
                    <td>{x.detail}</td>
                    <td>{x.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {has('team') && (
        <section id="feature-team" className="t-section">
          <p className="t-eyebrow">PEOPLE</p>
          <h2>함께하는 사람들</h2>
          <div className="d-team">
            {['대표 담당자', '서비스 담당자'].map((x, i) => (
              <article key={x}>
                <div className="d-person-art" aria-hidden="true">
                  <span>0{i + 1}</span>
                </div>
                <h3>{x}</h3>
                <p>실제 제작 시 이름·역할·소개·사진을 입력합니다.</p>
                <small>실제 인물·자격·경력이 아닌 소개 영역 예시</small>
              </article>
            ))}
          </div>
        </section>
      )}
      {has('schedule') && (
        <section id="feature-schedule" className="t-section">
          <p className="t-eyebrow">WEEKLY SCHEDULE</p>
          <h2>요일별 운영·시간표</h2>
          <div className="d-day-tabs" role="group" aria-label="요일 선택">
            {days.map((x, i) => (
              <button key={x} aria-pressed={day === i} onClick={() => setDay(i)}>
                {x}
              </button>
            ))}
          </div>
          <div className="d-schedule-result" role="status">
            <strong>{days[day]}요일</strong>
            <div>
              {day === 6 ? (
                <>
                  <h3>정기 휴무 · 예시</h3>
                  <p>휴무와 공휴일 운영은 실제 매장에 맞게 안내합니다.</p>
                </>
              ) : (
                <>
                  <h3>{day === 5 ? '10:00–15:00' : '10:00–19:00'} · 예시 운영시간</h3>
                  <p>
                    {day === 2 ? '오후 프로그램 14:00 · 예시 일정' : '방문·상담 가능 시간 안내'}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      {has('news') && (
        <section id="feature-news" className="t-section">
          <p className="t-eyebrow">NEWS & NOTICE</p>
          <h2>공지·소식</h2>
          <div className="d-news">
            {['운영시간 변경 안내', '이번 달 매장 소식', '처음 방문하시는 분께'].map((x, i) => (
              <details key={x}>
                <summary>
                  <small>예시 공지 0{i + 1}</small>
                  <strong>{x}</strong>
                  <span>＋</span>
                </summary>
                <p>
                  고객이 실제 휴무·행사·준비 사항을 안내하는 자리입니다. 현재 공지는 템플릿 동작
                  확인용이며 실제 일정이 아닙니다.
                </p>
              </details>
            ))}
          </div>
        </section>
      )}
      {has('process') && (
        <section id="feature-process" className="t-section">
          <p className="t-eyebrow">HOW IT WORKS</p>
          <h2>이용·상담 절차</h2>
          <ol className="d-process">
            {[
              ['문의', '전화나 연결된 외부 채널로 필요한 내용을 문의합니다.'],
              ['안내', '담당자가 이용 범위·일정·준비 사항을 안내합니다.'],
              ['이용', '안내받은 일정에 맞춰 방문하거나 서비스를 이용합니다.'],
            ].map(([name, desc], i) => (
              <li key={name}>
                <span>0{i + 1}</span>
                <h3>{name}</h3>
                <p>{desc}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
