'use client';

import { usePathname } from 'next/navigation';
import { WorkspaceLink as Link } from './WorkspaceLink';

export function WorkspaceNavigation({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const primary = [
    { href: '/account/settings', prefix: '/account', label: '내 정보', icon: '◎' },
    admin
      ? { href: '/admin', prefix: '/admin', label: '운영자 관리', icon: '▦' }
      : { href: '/dashboard', prefix: '/dashboard', label: '내 홈페이지', icon: '▤' },
  ];
  const secondary = admin
    ? [
        { href: '/admin/inquiries', label: '상담 요청' },
        { href: '/admin/projects', label: '제작 진행' },
        { href: '/admin/sites/new', label: '고객 홈페이지 제작' },
        { href: '/admin/evidence', label: '증빙 요청' },
        { href: '/admin/notifications', label: '알림 발송 상태' },
      ]
    : [
        { href: '/dashboard/projects', label: '상담·제작 진행' },
        { href: '/dashboard/evidence', label: '증빙 요청' },
      ];
  // The most specific section owns its detail routes. Highlight only one menu.
  const active = [...primary, ...secondary.map((item) => ({ ...item, prefix: item.href }))]
    .filter((item) => pathname === item.prefix || pathname.startsWith(item.prefix + '/'))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.href;

  return (
    <>
      <nav aria-label="내 계정 및 홈페이지">
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active === item.href ? 'page' : undefined}
          >
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      <nav aria-label="제작·상담 관리">
        {secondary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active === item.href ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
