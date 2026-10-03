import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { mode } from '@/lib/server/config';
import { emailConfigured, type NotificationJob } from '@/lib/server/notifications';
import { Shell } from '@/components/Shell';
import { NotificationPanel } from '@/components/admin/NotificationPanel';
export default async function Notifications() {
  const user = await requireUser(true);
  const jobs = await rpc<NotificationJob[]>(user, 'list_notifications');
  return (
    <Shell user={user}>
      <NotificationPanel jobs={jobs} configured={!!emailConfigured()} local={mode() === 'local'} />
    </Shell>
  );
}
