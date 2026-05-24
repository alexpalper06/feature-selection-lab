import React, {useState, useEffect, useCallback} from 'react';
import Sidebar from './Sidebar';
import Header, {type BreadcrumbItem} from './Header';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

const MOBILE_BREAKPOINT = 1024; // lg

export default function AppLayout({children, breadcrumbs}: AppLayoutProps): React.ReactElement {
    const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < MOBILE_BREAKPOINT);
    // Initialize state from localStorage for desktop, default to closed for mobile
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        if (window.innerWidth < MOBILE_BREAKPOINT) return false;
        const savedState = localStorage.getItem('sidebarOpen');
        return savedState !== null ? savedState === 'true' : true;
    });
    const [isScrolled, setIsScrolled] = useState<boolean>(false);

    const handleResize = useCallback(() => {
        const mobile = window.innerWidth < MOBILE_BREAKPOINT;
        setIsMobile(mobile);
        if (mobile) {
            setSidebarOpen(false);
        } else {
            // Restore desktop state from localStorage when resizing up
            const savedState = localStorage.getItem('sidebarOpen');
            setSidebarOpen(savedState !== null ? savedState === 'true' : true);
        }
    }, []);

    // Update the Sidebar visibility when the page is resized
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Update document title based on the active breadcrumb
    useEffect(() => {
        const baseTitle = 'Feature Selection Lab';

        if (breadcrumbs && breadcrumbs.length > 0) {
            // Grab the last breadcrumb label as the current page
            const currentPage = breadcrumbs[breadcrumbs.length - 1].label;
            document.title = `${currentPage} | ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }, [breadcrumbs]);

    const toggle = (): void => {
        setSidebarOpen((prev) => {
            const next = !prev;
            if (!isMobile) {
                localStorage.setItem('sidebarOpen', String(next));
            }
            return next;
        });
    };
    const close = (): void => setSidebarOpen(false);

    // Track scroll position of the main container
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 10);
    };

    const contentMargin = isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16';

    return (
        <div className="bg-bg-main text-text-main flex min-h-screen overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                onToggle={toggle}
                onClose={close}
            />

            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            {/* Scrollable parent container so content passes under the header */}
            <div
                onScroll={handleScroll}
                className={`flex-1 min-w-0 h-screen overflow-y-auto transition-all duration-300 relative ${contentMargin}`}
            >
                <Header
                    breadcrumbs={breadcrumbs}
                    onToggle={toggle}
                    isMobile={isMobile}
                    isScrolled={isScrolled}
                />

                {/* Removed overflow from main, it now scrolls with the parent */}
                <main className="p-8 min-h-[calc(100vh-2.5rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}