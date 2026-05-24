import React, {useState, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Home, Database, Upload, Moon, Sun, ChevronLeft, ChevronRight} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

interface NavItem {
    name: string;
    icon: LucideIcon;
    path: string;
}

const NAV_ITEMS: NavItem[] = [
    {name: 'Dashboard', icon: Home, path: '/'},
    {name: 'Repository List', icon: Database, path: '/datasets'},
    {name: 'Upload Dataset', icon: Upload, path: '/datasets/upload'},
];

interface SidebarProps {
    isOpen: boolean;
    isMobile: boolean;
    onToggle: () => void;
    onClose: () => void;
}

export default function Sidebar({isOpen, isMobile, onToggle, onClose}: SidebarProps): React.ReactElement {
    const {pathname} = useLocation();
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = (): void => {
        setIsDark((prev) => {
            const next = !prev;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    // When is on Desktop: collapsed, icon-only (w-16) or  expanded, complete (w-64)
    // When is on Mobile: hidden or completely visible
    const sidebarWidth = !isMobile && !isOpen ? 'w-16' : 'w-64';

    const translateClass = isMobile
        ? isOpen ? 'translate-x-0' : '-translate-x-full'
        : 'translate-x-0';

    // Only show labels when fully expanded
    const showLabels = isOpen;

    return (
        <aside
            aria-label="Main navigation"
            className={[
                'bg-surface text-text-main h-screen flex flex-col fixed left-0 top-0 border-r border-border-main',
                'transition-all duration-300 ease-in-out',
                sidebarWidth,
                translateClass,
                isMobile ? 'z-30' : 'z-10',
            ].join(' ')}
        >
            {/* Website name + Collapse Toggle*/}
            <div className="h-10 flex items-center flex-shrink-0  overflow-hidden px-2 gap-2">
                {/* Website name, only rendered when expanded */}
                {showLabels && (
                    <span className="text-text-h font-bold text-sm tracking-tight leading-tight whitespace-nowrap flex-1 pl-1 text-left">
                        Feature Selection Lab
                    </span>
                )}

                {/* Desktop collapse toggle, always visible, right-aligned when expanded, centered when collapsed */}
                {!isMobile && (
                    <button
                        onClick={onToggle}
                        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        className={[
                            'flex items-center justify-center p-1.5 rounded-lg text-sm font-medium flex-shrink-0',
                            'text-text-main/50 hover:text-text-h hover:bg-code-bg border border-transparent',
                            'transition-all duration-150 cursor-pointer',
                            !showLabels && 'w-full',
                        ].filter(Boolean).join(' ')}
                    >
                        {isOpen
                            ? <ChevronLeft className="w-4 h-4"/>
                            : <ChevronRight className="w-4 h-4"/>
                        }
                    </button>
                )}

                {/* Mobile close button */}
                {isMobile && isOpen && (
                    <button
                        onClick={onClose}
                        title="Close sidebar"
                        className="flex items-center justify-center p-1.5 rounded-lg text-sm font-medium flex-shrink-0
                                   text-text-main/50 hover:text-text-h hover:bg-code-bg border border-transparent
                                   transition-all duration-150 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4"/>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {showLabels && (
                    <p className="text-[11px] uppercase font-bold tracking-widest text-text-main/35 px-3 mb-2 text-left select-none whitespace-nowrap">
                        Navigation
                    </p>
                )}

                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            aria-current={isActive ? 'page' : undefined}
                            title={!showLabels ? item.name : undefined} // tooltip when icon-only
                            onClick={isMobile ? onClose : undefined}    // close on mobile nav
                            className={[
                                'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                                showLabels ? 'px-3' : 'px-0 justify-center',
                                isActive
                                    ? 'bg-bg-main text-accent border border-border-main shadow-sm'
                                    : 'text-text-main/70 hover:text-text-h hover:bg-code-bg border border-transparent',
                            ].join(' ')}
                        >

                            <item.icon
                                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                    isActive ? 'text-accent' : 'text-text-main/40'
                                }`}
                            />
                            {showLabels && <span className="whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom, light and dark mode toggle */}
            <div className="p-2 border-t border-border-main flex-shrink-0 space-y-0.5">
                {/* Light and dark toggle */}
                <button
                    onClick={toggleTheme}
                    title={!showLabels ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
                    className={[
                        'flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium',
                        'text-text-main/70 hover:text-text-h hover:bg-code-bg border border-transparent',
                        'transition-all duration-150 cursor-pointer',
                        showLabels ? 'px-3' : 'px-0 justify-center',
                    ].join(' ')}
                >
                    {isDark
                        ? <Sun className="w-4 h-4 text-text-main/40 flex-shrink-0"/>
                        : <Moon className="w-4 h-4 text-text-main/40 flex-shrink-0"/>
                    }
                    {showLabels && (
                        <span className="whitespace-nowrap">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    )}
                </button>
            </div>
        </aside>
    );
}