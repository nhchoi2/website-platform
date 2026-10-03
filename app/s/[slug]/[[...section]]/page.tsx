import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isPlatformHost } from '@/lib/hosts';
import { rpc } from '@/lib/server/data';
import { contentSchema, type Content } from '@/lib/content';
import { SiteRenderer, sitePage } from '@/templates/shared/SiteRenderer';
async function getSite(slug: string) {
  if (!isPlatformHost((await headers()).get('host') || '')) return null;
  return rpc<{ id: string; content: Content } | null>(null, 'get_public_site', {
    p_slug: slug,
    p_host: null,
  });
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; section?: string[] }>;
}): Promise<Metadata> {
  const site = await getSite((await params).slug);
  return {
    title: site?.content.name || '매장을 찾을 수 없습니다',
    description: site?.content.tagline,
    icons: site?.content.iconId ? { icon: `/api/media/${site.content.iconId}` } : undefined,
    robots: { index: false, follow: false },
  };
}
export default async function PublicSite({
  params,
}: {
  params: Promise<{ slug: string; section?: string[] }>;
}) {
  const route = await params;
  const site = await getSite(route.slug);
  if (!site) notFound();
  return (
    <SiteRenderer
      content={contentSchema.parse(site.content)}
      siteId={site.id}
      page={sitePage(site.content, route.section)}
      base={`/s/${route.slug}`}
    />
  );
}
