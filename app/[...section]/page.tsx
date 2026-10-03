import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { isPlatformHost, normalizeHost } from '@/lib/hosts';
import { rpc } from '@/lib/server/data';
import { contentSchema, type Content } from '@/lib/content';
import { SiteRenderer, sitePage } from '@/templates/shared/SiteRenderer';
export async function generateMetadata() {
  const host = normalizeHost((await headers()).get('host') || '');
  if (isPlatformHost(host)) return {};
  const site = await rpc<{ content: Content } | null>(null, 'get_public_site', {
    p_slug: null,
    p_host: host,
  });
  return {
    title: { absolute: site?.content.name || '페이지를 찾을 수 없습니다' },
    description: site?.content.tagline,
    icons: site?.content.iconId ? { icon: `/api/media/${site.content.iconId}` } : undefined,
  };
}
export default async function TenantPage({ params }: { params: Promise<{ section: string[] }> }) {
  const host = normalizeHost((await headers()).get('host') || '');
  if (isPlatformHost(host)) notFound();
  const site = await rpc<{ id: string; content: Content } | null>(null, 'get_public_site', {
    p_slug: null,
    p_host: host,
  });
  if (!site) notFound();
  const content = contentSchema.parse(site.content);
  return (
    <SiteRenderer
      content={content}
      siteId={site.id}
      page={sitePage(content, (await params).section)}
    />
  );
}
