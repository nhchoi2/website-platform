import type { Metadata } from 'next';
import { mode } from '@/lib/server/config';
import './globals.css';
export const metadata: Metadata = {
  title: { default: '소상공인 웹사이트 제작·관리 | 쿠피', template: '%s | 쿠피' },
  description:
    '업종별 템플릿과 필요한 기능을 선택하고 제작을 문의하는 소상공인 홈페이지 제작·관리 서비스.',
};
export const dynamic = 'force-dynamic';
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {process.env.APP_MODE === 'local' && mode() === 'local' && (
          <div className="local-banner">
            <strong>LOCAL</strong> 로컬 시연 · 이 컴퓨터에 저장됩니다 · 실제 메일·Supabase·도메인
            미연결
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
