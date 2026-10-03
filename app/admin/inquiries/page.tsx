import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { AdminInquiries } from '@/components/inquiries/AdminInquiries';
import type { Inquiry } from '@/lib/inquiries';
export const metadata = { title: '제작 상담 관리', robots: { index: false, follow: false } };
export default async function Inquiries() {
  const user = await requireUser(true);
  const inquiries = await rpc<Inquiry[]>(user, 'list_inquiries');
  return (
    <Shell user={user}>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">INQUIRIES</p>
          <h1>제작 상담 요청</h1>
          <p className="muted">선택 구성과 연락처를 확인하고 상담 상태를 관리합니다.</p>
        </div>
      </header>
      <div className="page-body">
        <AdminInquiries inquiries={inquiries} />
      </div>
    </Shell>
  );
}
