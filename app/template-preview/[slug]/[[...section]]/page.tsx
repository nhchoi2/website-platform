import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { findTemplate } from '@/templates/catalog/catalog';
import { parseOptions, demoPages, type DemoPage, type Query } from '@/templates/catalog/options';
import { DemoSite } from '@/templates/catalog/DemoSite';
export const metadata: Metadata = {
  title: { absolute: 'KOOFY · 템플릿 예시 사이트' },
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; section?: string[] }>;
  searchParams: Promise<Query>;
}) {
  const { slug, section } = await params;
  const template = findTemplate(slug);
  if (!template || (section && section.length > 1)) notFound();
  const options = parseOptions(await searchParams);
  const page = (section?.[0] || 'home') as DemoPage;
  if (
    options.pages === 1
      ? page !== 'home'
      : !demoPages(options.pages, template).some((nav) => nav.id === page)
  )
    notFound();
  return <DemoSite template={template} options={options} page={page} />;
}
