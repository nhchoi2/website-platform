'use client';
import { useState, useRef } from 'react';
import { featureOptions, safeExternalLink, type PreviewOptions, type FeatureId } from './options';

// Reused for every demo page. No booking/contact is submitted by example buttons.
export function CommonFeatures({ options }: { options: PreviewOptions }) {
  const [example, setExample] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  function openExample(label: string) {
    setExample(label);
    dialog.current?.showModal();
  }
  const labels: Partial<Record<FeatureId, string>> = {
    consult: '상담하기',
    reserve: '예약하기',
    place: '플레이스',
    kakao: '카카오 문의',
  };
  return (
    <>
      <div className="t-floating" aria-label="선택한 빠른 연결 기능">
        {featureOptions
          .filter((f) => f.floating && options.features.includes(f.id))
          .map((feature) => {
            if (feature.id === 'top')
              return (
                <button key="top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  ↑ 맨 위로
                </button>
              );
            const url = safeExternalLink(options.links[feature.id] || '');
            return url ? (
              <a key={feature.id} href={url} target="_blank" rel="noopener noreferrer">
                {labels[feature.id]} ↗
              </a>
            ) : (
              <button key={feature.id} onClick={() => openExample(feature.label)}>
                {labels[feature.id]} ↗
              </button>
            );
          })}
      </div>
      <dialog ref={dialog} className="t-example-dialog" aria-label="예시 기능 안내">
        <strong>{example}</strong>
        <p>
          연결 동작을 보여주는 예시입니다. 실제 상담이나 예약은 접수되지 않습니다. 템플릿
          상세보기에서 연결할 HTTPS 주소를 입력하면 해당 페이지를 열어 볼 수 있습니다.
        </p>
        <button onClick={() => dialog.current?.close()}>확인</button>
      </dialog>
    </>
  );
}
