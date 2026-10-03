import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { ProjectPanel } from '@/components/projects/ProjectPanel';
import type { ProjectDetail } from '@/lib/projects';
export const metadata = { title: '제작 진행 상세', robots: { index: false, follow: false } };
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(false);
  const id = (await params).id;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await rpc<ProjectDetail>(user, 'get_project', { p_project: id }).catch(() => null);
  if (!detail) notFound();
  return (
    <Shell user={user} active="dashboard">
      <ProjectPanel detail={detail} admin={false} />
    </Shell>
  );
}
