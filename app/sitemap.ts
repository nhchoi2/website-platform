import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/server/config';
export const dynamic = 'force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/templates', '/templates/hyehwa', '/pricing', '/guide'].map((path) => ({
    url: new URL(path, appUrl()).href,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
