'use client';
import { useState, type ReactNode } from 'react';
import type { PreviewOptions } from './options';

export function TemplateHeader({
  brand,
  home,
  options,
  children,
  logo,
  live = false,
}: {
  brand: string;
  home: string;
  options: PreviewOptions;
  children: ReactNode;
  logo?: string;
  live?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`t-header t-nav-${options.nav || 'right'} ${options.mobileNav === 'hamburger' ? 't-mobile-hamburger' : ''}`}
    >
      <a className="t-brand" href={home}>
        {logo && <img className="customer-logo" src={logo} alt={`${brand} 로고`} />}
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
        aria-label={live ? '사이트 메뉴' : '예시 사이트 메뉴'}
        className={open ? 'is-open' : ''}
        onClick={() => setOpen(false)}
      >
        {children}
      </nav>
    </header>
  );
}
