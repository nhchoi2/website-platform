import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { ContactForm } from '@/components/account/ContactForm';
import type { AccountDetails } from '@/lib/types';
export const metadata = { title: '내 정보', robots: { index: false, follow: false } };
export default async function SettingsPage() {
  const user = await requireUser();
  const details = await rpc<AccountDetails>(user, 'get_account_details');
  return (
    <Shell user={user} active="account">
      <ContactForm details={details} email={user.email} admin={user.admin} />
    </Shell>
  );
}
