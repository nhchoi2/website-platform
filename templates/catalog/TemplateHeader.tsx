'use client';
import { useState, type ReactNode } from 'react';
import type { PreviewOptions } from './options';

export function TemplateHeader({
  brand,
  home,
  options,
  children,
}: {
  brand: string;
  home: string;
  options: PreviewOptions;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`t-header t-nav-${options.nav || 'right'} ${options.mobileNav === 'hamburger' ? 't-mobile-hamburger' : ''}`}
    >
      <a className="t-brand" href={home}>
        {brand}
        <span>✳</span>
      </a>
      <button
        className="t-menu-toggle"
        aria-expanded={open}
        aria-controls="template-menu"
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">{open ? '×' : '☰'}</span> {open ? '닫기' : '메뉴'}
      </button>
      <nav
        id="template-menu"
        aria-label="예시 사이트 메뉴"
        className={open ? 'is-open' : ''}
        onClick={() => setOpen(false)}
      >
        {children}
      </nav>
    </header>
  );
}
