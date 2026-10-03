'use client';
import Link from 'next/link';
import { SiteSetup } from '@/components/admin/SiteSetup';
export function TemplatePicker() {
  return (
    <div className="page-body">
      <h1>우리 가게 홈페이지의 시작</h1>
      <p>
        원하는 디자인을 보고 상담하면 운영자가 제작을 도와드립니다. 직접 초안을 시작할 수도
        있습니다.
      </p>
      <div className="header-actions">
        <Link href="/templates" className="button secondary">
          템플릿 둘러보기
        </Link>
        <Link href="/contact" className="button primary">
          제작 상담하기
        </Link>
        <Link href="/dashboard/projects" className="button secondary">
          상담·제작 진행 확인
        </Link>
      </div>
      <SiteSetup />
    </div>
  );
}
