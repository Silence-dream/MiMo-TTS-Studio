'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
}

function resolveHref(href: string): string {
  const isDesktop = typeof window !== 'undefined' && Boolean(window.mimoDesktop);
  if (!isDesktop || !href.startsWith('/')) return href;
  return `#${href}`;
}

export function AppLink({ href, children, ...props }: AppLinkProps) {
  return (
    <a href={resolveHref(href)} {...props}>
      {children}
    </a>
  );
}
