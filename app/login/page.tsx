import { currentUser } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';
export const metadata: Metadata = { title: '로그인', robots: { index: false, follow: false } };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  if (!['reset', 'recover'].includes(params.mode || '')) {
    const user = await currentUser();
    if (user) redirect(user.admin ? '/admin' : '/dashboard');
  }
  return (
    <AuthForm
      initialMode={
        ['signup', 'recover', 'reset'].includes(params.mode || '') ? params.mode! : 'login'
      }
      token={params.token || ''}
      expired={!!params.error}
    />
  );
}
