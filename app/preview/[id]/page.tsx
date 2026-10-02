import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { z } from 'zod';
import { requireUser } from '@/lib/server/auth';
import { siteDetail } from '@/lib/server/data';
import { Restaurant } from '@/templates/hyehwa/Restaurant';
export const metadata: Metadata = {
  title: '비공개 미리보기',
  robots: { index: false, follow: false },
};
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ revision?: string; embed?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await siteDetail(user, id).catch(() => null);
  if (!detail) notFound();
  const revision = query.revision ? detail.revisions.find((r) => r.id === query.revision) : null;
  if (query.revision && !revision) notFound();
  return (
    <>
      {!query.embed && (
        <div className="preview-notice">
          비공개 미리보기 ·{' '}
          {revision
            ? `제출본 v${revision.draft_version}`
            : `현재 초안 v${detail.site.draft_version}`}{' '}
          · 공개 홈페이지에 반영되지 않습니다.
        </div>
      )}
      <Restaurant content={revision?.content || detail.site.draft} siteId={id} privateImages />
    </>
  );
}
