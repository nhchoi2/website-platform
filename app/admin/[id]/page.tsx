import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/server/auth';
import { siteDetail } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { ReviewPanel } from '@/components/admin/ReviewPanel';
export default async function AdminSite({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(true);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await siteDetail(user, id).catch(() => null);
  if (!detail) notFound();
  return (
    <Shell user={user} active="admin">
      <ReviewPanel detail={detail} />
    </Shell>
  );
}
