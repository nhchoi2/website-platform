import { PageIntro } from '@/components/marketing/SiteShell';
import { SelectionSummary } from '@/components/inquiries/SelectionSummary';
import { InquiryForm } from '@/components/inquiries/InquiryForm';
import { selectionSummary } from '@/lib/inquiries';
import { inquiryEnabled } from '@/lib/server/inquiries';
import { mode } from '@/lib/server/config';
import type { Query } from '@/templates/catalog/options';
export const metadata = { title: '홈페이지 제작 상담', robots: { index: false, follow: true } };
export default async function Contact({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const slug = typeof query.template === 'string' ? query.template : '';
  const selection = selectionSummary(slug, query);
  return (
    <main id="main" className="m-container">
      <PageIntro label="LET’S TALK" title="우리 가게의 이야기를 들려주세요.">
        템플릿을 골랐다면 선택한 구성이 함께 전달됩니다.
        <br />
        아직 정하지 못했다면 필요한 내용만 알려주세요.
      </PageIntro>
      <div className="m-inquiry-layout">
        <InquiryForm selection={selection} enabled={inquiryEnabled()} local={mode() === 'local'} />
        <SelectionSummary selection={selection} />
      </div>
    </main>
  );
}
