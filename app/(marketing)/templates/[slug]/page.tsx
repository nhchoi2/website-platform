import { notFound } from 'next/navigation';
import { findTemplate } from '@/templates/catalog/catalog';
import { parseOptions, type Query } from '@/templates/catalog/options';
import { TemplateDetail } from '@/components/marketing/TemplateDetail';
import { marketingMetadata } from '@/lib/server/marketing';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const template = findTemplate((await params).slug);
  if (!template) notFound();
  return marketingMetadata(
    `${template.name} · ${template.industry} 홈페이지 템플릿`,
    template.description,
    `/templates/${template.slug}`,
  );
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Query>;
}) {
  const template = findTemplate((await params).slug);
  if (!template) notFound();
  return <TemplateDetail template={template} initial={parseOptions(await searchParams)} />;
}
