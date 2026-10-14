'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ProposalContent, ProposalStyle } from '@/lib/proposals';
import { proposalStyles } from '@/lib/proposals';

// Next preserves the scroll position when catch-all routes share a visible page root.
// Each proposal page should start at its heading when changing design or section.
export function ProposalPageTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function Navigation({
  token,
  style,
  content,
}: {
  token: string;
  style: ProposalStyle;
  content: ProposalContent;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/proposals/${token}/${style}`;
  const design = proposalStyles.find((s) => s.id === style)!;
  return (
    <>
      <div className="p-proposal-bar">
        <span>
          시안 {design.letter} · {design.name}
        </span>
        <Link href={`/proposals/${token}`} prefetch={false}>
          세 가지 시안 비교 ↗
        </Link>
      </div>
      <header className="p-header">
        {style === 'yongs' && <p className="p-header-tagline">대나무에서 시작되는 특별한 한 점</p>}
        <Link className="p-brand" href={base} prefetch={false} onClick={() => setOpen(false)}>
          <span className="p-brand-small">혜화 삼겹살</span>
          <strong>대통령</strong>
          <span className="p-brand-location">직영 본점 · HYEHWA</span>
        </Link>
        <button
          type="button"
          className="p-mobile-toggle"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-controls="proposal-navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '닫기 ×' : '메뉴 ☰'}
        </button>
        <nav
          id="proposal-navigation"
          aria-label="홈페이지 메뉴"
          className={open ? 'is-open' : ''}
          onClick={() => setOpen(false)}
        >
          {[
            { name: '홈', path: '' },
            { name: '메뉴 소개', path: '/menu' },
            { name: '매장 소개', path: '/visit' },
          ].map((item) => (
            <Link
              href={base + item.path}
              prefetch={false}
              key={item.path}
              aria-current={pathname === base + item.path ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
          <a className="p-reserve" href={`tel:${content.phone.replace(/[^+0-9]/g, '')}`}>
            전화 예약 ↗
          </a>
        </nav>
      </header>
    </>
  );
}

export function FloatingActions({ content }: { content: ProposalContent }) {
  return (
    <aside className="p-floating" aria-label="빠른 문의">
      <a
        href={content.links.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="인스타그램 열기"
      >
        <span aria-hidden="true">◎</span>
        <b>인스타그램</b>
      </a>
      {content.links.kakao ? (
        <a className="p-kakao" href={content.links.kakao} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">톡</span>
          <b>카카오 상담</b>
        </a>
      ) : (
        <button
          className="p-kakao"
          type="button"
          disabled
          title="카카오톡 연결 주소 확인 후 활성화됩니다."
        >
          <span aria-hidden="true">톡</span>
          <b>연결 준비 중</b>
        </button>
      )}
      <a
        href={content.links.place}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="네이버 플레이스에서 위치와 예약 확인"
      >
        <span aria-hidden="true">N</span>
        <b>플레이스</b>
      </a>
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'instant'
              : 'smooth',
          })
        }
        aria-label="맨 위로 이동"
      >
        <span aria-hidden="true">↑</span>
        <b>맨 위로</b>
      </button>
    </aside>
  );
}
