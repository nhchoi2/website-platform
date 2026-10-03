import type { CSSProperties } from 'react';
import type { Template } from './catalog';
import { templatePhotos } from './images';
import './catalog.css';

// Demo artwork only. Customer uploads continue to use private object storage.
export function TemplateArt({
  template,
  compact = false,
  photoIndex,
  fullSize = false,
}: {
  template: Template;
  compact?: boolean;
  photoIndex?: number;
  fullSize?: boolean;
}) {
  const artwork = template.artSlug || template.slug;
  const photos = templatePhotos(template);
  const photo = photoIndex === undefined ? photos.hero : photos.items[photoIndex] || photos.hero;
  if (template.live && !photo?.src)
    return (
      <div className="t-art t-art-empty" aria-label="등록된 사진 없음">
        사진을 준비하고 있습니다.
      </div>
    );
  return (
    <div
      className={`t-art t-art-${artwork} ${compact ? 't-art-compact' : ''}`}
      style={
        {
          '--t-accent': template.accent,
          '--t-paper': template.background,
          '--t-ink': template.ink,
        } as CSSProperties
      }
    >
      <img
        src={photo.src}
        srcSet={fullSize ? undefined : `${photo.small} 640w, ${photo.src} 1440w`}
        sizes={compact ? '(max-width: 640px) 100vw, 480px' : '(max-width: 768px) 100vw, 1440px'}
        alt={template.live ? photo.alt : `${photo.alt} · AI 생성 예시`}
        width={1440}
        height={960}
        loading={compact && !fullSize ? 'lazy' : 'eager'}
        decoding="async"
      />
      {!compact && !template.live && (
        <span className="t-art-label">{template.english} / 예시 이미지</span>
      )}
    </div>
  );
}
