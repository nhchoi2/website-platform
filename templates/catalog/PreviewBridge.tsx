'use client';
import { useEffect } from 'react';
import type { DemoPage } from './options';
export function PreviewBridge({ slug, page }: { slug: string; page: DemoPage }) {
  useEffect(() => {
    if (window.parent !== window)
      window.parent.postMessage(
        { type: 'koofy-template-page', slug, page },
        window.location.origin,
      );
  }, [slug, page]);
  return null;
}
