import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { ConsentForm } from '@/components/account/ConsentForm';
export const metadata = { title: '서비스 이용 동의', robots: { index: false, follow: false } };
export default async function ConsentPage() {
  const user = await requireUser(false, true);
  if (await rpc<boolean>(user, 'has_account_consent')) redirect('/account');
  return (
    <Shell user={user}>
      <ConsentForm />
    </Shell>
  );
}
