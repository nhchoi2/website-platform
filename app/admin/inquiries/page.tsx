import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
import { AdminInquiries } from '@/components/inquiries/AdminInquiries';
import type { Inquiry } from '@/lib/inquiries';
import { inquiryEnabled } from '@/lib/server/inquiries';
export const metadata = { title: '제작 상담 관리', robots: { index: false, follow: false } };
export default async function Inquiries() {
  const user = await requireUser(true);
  const enabled = inquiryEnabled();
  const inquiries = enabled ? await rpc<Inquiry[]>(user, 'list_inquiries') : [];
  return (
    <Shell user={user} active="admin">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">INQUIRIES</p>
          <h1>제작 상담 요청</h1>
          <p className="muted">선택 구성과 연락처를 확인하고 상담 상태를 관리합니다.</p>
        </div>
      </header>
      <div className="page-body">
        {enabled ? (
          <AdminInquiries inquiries={inquiries} />
        ) : (
          <p className="panel">
            온라인 상담 접수는 준비 중입니다. 운영 저장소와 개인정보 안내를 확인한 뒤 활성화해
            주세요. 현재 문의는 koofylab@gmail.com에서 확인합니다.
          </p>
        )}
      </div>
    </Shell>
  );
}
