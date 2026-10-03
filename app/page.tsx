import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { isPlatformHost, normalizeHost } from '@/lib/hosts';
import { rpc } from '@/lib/server/data';
import { contentSchema, type Content } from '@/lib/content';
import { SiteRenderer } from '@/templates/shared/SiteRenderer';
import { HomePage } from '@/components/marketing/HomePage';
import { marketingMetadata } from '@/lib/server/marketing';
import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const host = normalizeHost((await headers()).get('host') || '');
  if (isPlatformHost(host))
    return marketingMetadata(
      '소상공인 웹사이트 제작·관리 | 쿠피',
      '음식점·미용실·헬스장·마트·전문 사무실을 위한 홈페이지 제작. 업종별 템플릿과 페이지 구성, 추가 기능을 미리 보고 제작을 문의하세요.',
    );
  const site = await rpc<{ content: Content } | null>(null, 'get_public_site', {
    p_slug: null,
    p_host: host,
  });
  return {
    title: { absolute: site?.content.name || '매장을 찾을 수 없습니다' },
    description: site?.content.tagline || '',
    icons: site?.content.iconId ? { icon: `/api/media/${site.content.iconId}` } : undefined,
    robots: { index: !!site, follow: !!site },
  };
}
export default async function Home() {
  const host = normalizeHost((await headers()).get('host') || '');
  if (isPlatformHost(host)) return <HomePage />;
  const site = await rpc<{ id: string; content: Content } | null>(null, 'get_public_site', {
    p_slug: null,
    p_host: host,
  });
  if (!site) notFound();
  return <SiteRenderer content={contentSchema.parse(site.content)} siteId={site.id} />;
}
