import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { ProjectList } from '@/components/projects/ProjectList';
import type { Project } from '@/lib/projects';
import type { Inquiry } from '@/lib/inquiries';
export const metadata = { title: '제작 진행', robots: { index: false, follow: false } };
export default async function Projects() {
  const user = await requireUser(true);
  const projects = await rpc<Project[]>(user, 'list_projects');
  const inquiries: Inquiry[] = [];
  return (
    <Shell user={user}>
      <ProjectList projects={projects} inquiries={inquiries} admin={true} />
    </Shell>
  );
}
