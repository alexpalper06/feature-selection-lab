import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface HeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    isMobile: boolean;
    onToggle: () => void;
    isScrolled: boolean;
}

export default function Header({ breadcrumbs, onToggle, isMobile, isScrolled }: HeaderProps): React.ReactElement {
    const crumbs = breadcrumbs ?? [{ label: 'Dashboard' }];

    return (
        <header
            className={`h-10 sticky top-0 z-10 flex-shrink-0 flex items-center gap-4 px-6 bg-bg-main/90 backdrop-blur-md transition-all duration-300 ${
                isScrolled ? 'border-b border-border-main/40 shadow-sm' : 'border-b border-transparent shadow-none'
            }`}
        >
            {isMobile && (
                <>
                    <button
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                        className="p-1.5 rounded-lg text-text-main/50 hover:text-text-h hover:bg-code-bg border
                                   border-transparent transition-all duration-150 flex-shrink-0 cursor-pointer"
                    >
                        <Menu className="w-4.5 h-4.5" />
                    </button>
                    <span className="w-px h-5 bg-border-main flex-shrink-0" aria-hidden="true" />
                </>
            )}

            <nav className="flex items-center gap-1 min-w-0" aria-label="Breadcrumb">
                {crumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <ChevronRight className="w-3.5 h-3.5 text-text-main/25 flex-shrink-0 mx-0.5" />
                        )}
                        {crumb.href ? (
                            <Link
                                to={crumb.href}
                                className="text-sm text-text-main/50 hover:text-accent font-medium transition-colors truncate"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-sm font-semibold text-text-h truncate" aria-current="page">
                                {crumb.label}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </nav>
        </header>
    );
}