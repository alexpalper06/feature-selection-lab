// src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export default function Header({ breadcrumbs }: HeaderProps): React.ReactElement {
  const crumbs = breadcrumbs ?? [{ label: 'Dashboard' }];

  return (
    <header className="h-14 bg-bg-main border-b border-border-main flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
      <nav className="flex items-center gap-1" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-text-main/30 flex-shrink-0 mx-0.5" />
            )}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-sm text-text-main/60 hover:text-accent font-medium transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-text-h" aria-current="page">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </header>
  );
}