import type { Metadata } from 'next';
import { mode } from '@/lib/server/config';
import './globals.css';
export const metadata: Metadata = {
  title: { default: '가게담 · 음식점 홈페이지 관리', template: '%s | 가게담' },
  description: '가게의 이야기를 한 페이지에 담다.',
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
