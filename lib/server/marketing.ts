import 'server-only';
import type { Metadata } from 'next';
import { appUrl } from './config';
export function marketingMetadata(title: string, description: string, path = '/'): Metadata {
  const url = new URL(path, appUrl()).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: '쿠피 사이트',
      locale: 'ko_KR',
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}
