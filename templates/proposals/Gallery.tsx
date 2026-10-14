'use client';
import { useRef, useState } from 'react';
import type { ProposalPhoto } from '@/lib/proposals';
import { Photo } from './Photo';

export function Gallery({ photos }: { photos: ProposalPhoto[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  function show(i: number) {
    setIndex(i);
    setOpen(true);
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
    setOpen(false);
  }
  function move(step: number) {
    setIndex((i) => (i + step + photos.length) % photos.length);
  }
  if (!photos.length) return null;
  return (
    <>
      <div className="p-gallery">
        {photos.map((photo, i) => (
          <button
            type="button"
            key={photo.id}
            onClick={() => show(i)}
            aria-label={`${photo.label} 크게 보기`}
          >
            <Photo photo={photo} />
            <span>크게 보기 ↗</span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="p-lightbox"
        aria-label="매장 사진 크게 보기"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') move(1);
          if (e.key === 'ArrowLeft') move(-1);
        }}
      >
        <div className="p-lightbox-header">
          <span>
            {index + 1} / {photos.length} · {photos[index].label}
          </span>
          <button type="button" onClick={close} aria-label="사진 닫기">
            닫기 ×
          </button>
        </div>
        {open && (
          <img
            key={photos[index].id}
            src={photos[index].src}
            alt={photos[index].label}
            onError={(event) => {
              if (!event.currentTarget.dataset.fallback) {
                event.currentTarget.dataset.fallback = 'true';
                event.currentTarget.src = photos[index].fullFallback;
              }
            }}
          />
        )}
        <div className="p-lightbox-controls">
          <button type="button" onClick={() => move(-1)}>
            ← 이전 사진
          </button>
          <button type="button" onClick={() => move(1)}>
            다음 사진 →
          </button>
        </div>
      </dialog>
    </>
  );
}
