import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
export const metadata = { title: '홈페이지 관리', robots: { index: false, follow: false } };
export default async function Account() {
  const user = await requireUser();
  if (!user.admin && !(await rpc<string | null>(user, 'get_own_site')))
    redirect('/account/settings');
  redirect(user.admin ? '/admin' : '/dashboard');
}
