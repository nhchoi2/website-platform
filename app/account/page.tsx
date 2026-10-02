import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/server/auth';
export const metadata = { title: '홈페이지 관리', robots: { index: false, follow: false } };
export default async function Account() {
  const user = await requireUser();
  redirect(user.admin ? '/admin' : '/dashboard');
}
