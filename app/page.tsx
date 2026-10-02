import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { isPlatformHost, normalizeHost } from '@/lib/hosts';
import { rpc } from '@/lib/server/data';
import { contentSchema, type Content } from '@/lib/content';
import { Restaurant } from '@/templates/hyehwa/Restaurant';
export default async function Home() {
  const host = normalizeHost((await headers()).get('host') || '');
  if (isPlatformHost(host)) redirect('/dashboard');
  const site = await rpc<{ id: string; content: Content } | null>(null, 'get_public_site', {
    p_slug: null,
    p_host: host,
  });
  if (!site) notFound();
  return <Restaurant content={contentSchema.parse(site.content)} siteId={site.id} />;
}
