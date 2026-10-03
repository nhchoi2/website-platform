import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { ProjectList } from '@/components/projects/ProjectList';
import type { Project } from '@/lib/projects';
import type { Inquiry } from '@/lib/inquiries';
export const metadata = { title: '제작 진행', robots: { index: false, follow: false } };
export default async function Projects() {
  const user = await requireUser(false);
  const [projects, inquiries] = await Promise.all([
    rpc<Project[]>(user, 'list_projects'),
    rpc<Inquiry[]>(user, 'get_my_inquiries'),
  ]);
  return (
    <Shell user={user}>
      <ProjectList projects={projects} inquiries={inquiries} admin={false} />
    </Shell>
  );
}
