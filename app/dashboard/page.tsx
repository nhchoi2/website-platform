import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/auth';
import { rpc, siteDetail } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { TemplatePicker } from '@/components/dashboard/TemplatePicker';
import { Editor } from '@/components/dashboard/Editor';
export const metadata: Metadata = { title: '내 홈페이지', robots: { index: false, follow: false } };
export default async function Dashboard() {
  const user = await requireUser();
  if (user.admin) redirect('/admin');
  const ownId = await rpc<string | null>(user, 'get_own_site');
  const own = ownId ? await siteDetail(user, ownId) : null;
  return (
    <Shell user={user}>
      {own ? <Editor detail={own} /> : <TemplatePicker />}
    </Shell>
  );
}
