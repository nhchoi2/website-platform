import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { EvidencePanel } from '@/components/projects/EvidencePanel';
import type { Evidence, Project } from '@/lib/projects';
export const metadata = { title: '증빙 요청', robots: { index: false, follow: false } };
export default async function EvidencePage() {
  const user = await requireUser(false);
  const [items, projects] = await Promise.all([
    rpc<Evidence[]>(user, 'list_evidence'),
    rpc<Project[]>(user, 'list_projects'),
  ]);
  return (
    <Shell user={user}>
      <EvidencePanel items={items} projects={projects} admin={false} />
    </Shell>
  );
}
