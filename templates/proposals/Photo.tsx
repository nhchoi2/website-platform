'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { ProposalPhoto } from '@/lib/proposals';

export function Photo({
  photo,
  full = false,
  eager = false,
  className = '',
}: {
  photo: ProposalPhoto;
  full?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const [fallback, setFallback] = useState(false);
  return (
    <div className={`p-photo ${className}`}>
      <Image
        src={
          fallback
            ? full
              ? photo.fullFallback
              : photo.smallFallback
            : full
              ? photo.src
              : photo.small
        }
        alt={photo.label}
        fill
        sizes={full ? '(max-width: 760px) 100vw, 80vw' : '(max-width: 760px) 100vw, 40vw'}
        unoptimized
        preload={eager}
        style={{ objectFit: 'cover' }}
        onError={() => setFallback(true)}
      />
    </div>
  );
}
