import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/server/config';
import { templateCatalog } from '@/templates/catalog/catalog';
export const dynamic = 'force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/templates',
    ...templateCatalog.map((template) => `/templates/${template.slug}`),
    '/projects',
    '/pricing',
    '/guide',
  ].map((path) => ({
    url: new URL(path, appUrl()).href,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
