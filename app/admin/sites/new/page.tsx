import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { SiteSetup, type CustomerChoice } from '@/components/admin/SiteSetup';
import type { Inquiry } from '@/lib/inquiries';
export default async function NewSite({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const user = await requireUser(true);
  const customers = await rpc<CustomerChoice[]>(user, 'list_customers');
  const query = await searchParams;
  const inquiry = query.inquiry
    ? (await rpc<Inquiry[]>(user, 'list_inquiries')).find((i) => i.id === query.inquiry)
    : undefined;
  return (
    <Shell user={user}>
      <div className="page-body">
        <h1>고객 홈페이지 제작</h1>
        <SiteSetup customers={customers.filter((c) => c.id !== user.id)} inquiry={inquiry} admin />
      </div>
    </Shell>
  );
}
