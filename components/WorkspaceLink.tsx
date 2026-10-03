'use client';

import Link, { useLinkStatus } from 'next/link';
import type { ComponentProps } from 'react';

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="workspace-navigation-status" role="status" aria-live="polite">
      화면을 불러오고 있습니다…
    </span>
  ) : null;
}

export function WorkspaceLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationStatus />
    </Link>
  );
}
