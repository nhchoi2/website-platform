import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { isPlatformHost, normalizeHost } from '@/lib/hosts';
import { rpc } from '@/lib/server/data';
import { contentSchema, type Content } from '@/lib/content';
import { Restaurant } from '@/templates/hyehwa/Restaurant';
import { HomePage } from '@/components/marketing/HomePage';
import { marketingMetadata } from '@/lib/server/marketing';
import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const host = normalizeHost((await headers()).get('host') || '');
  if (isPlatformHost(host))
    return marketingMetadata(
      '소상공인 웹사이트 제작·관리 | 쿠피',
      '음식점 홈페이지를 직접 편집하고, 쿠피의 검수 후 공개하세요. 템플릿 선택부터 사진·메뉴 관리, 고객 도메인 연결까지 함께합니다.',
    );
  const site = await rpc<{ content: Content } | null>(null, 'get_public_site', {
    p_slug: null,
    p_host: host,
  });
  return {
    title: { absolute: site?.content.name || '매장을 찾을 수 없습니다' },
    description: site?.content.tagline || '',
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
  return <Restaurant content={contentSchema.parse(site.content)} siteId={site.id} />;
}
