import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/server/auth';
import { siteDetail } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { Editor } from '@/components/dashboard/Editor';
export default async function AdminEdit({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(true);
  const detail = await siteDetail(user, (await params).id).catch(() => null);
  if (!detail) notFound();
  return (
    <Shell user={user}>
      <Editor detail={detail} admin />
    </Shell>
  );
}
