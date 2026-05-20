// src/components/layout/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, Upload, Moon, Sun, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Repository List', icon: Database, path: '/datasets' },
  { name: 'Upload Dataset', icon: Upload, path: '/datasets/upload' },
];

export default function Sidebar(): React.ReactElement {
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize theme based on localStorage or OS preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = (): void => {
    setIsDark((prevDark) => {
      const newDark = !prevDark;
      if (newDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newDark;
    });
  };

  return (
    <aside
      aria-label="Main navigation"
      className="w-64 bg-bg-main text-text-main h-screen flex flex-col fixed left-0 top-0 border-r border-border-main"
    >
      <div className="h-14 flex items-center gap-2.5 px-6 border-b border-border-main flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent-bg border border-accent-border flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-accent" />
        </div>
        <span className="text-text-h font-bold text-base tracking-tight">
          Feature Selector Lab
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent-bg text-accent border border-accent-border'
                  : 'text-text-main hover:bg-accent-bg hover:text-accent border border-transparent',
              ].join(' ')}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-text-main/50'}`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2  flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-accent-bg hover:text-accent transition-colors text-sm text-text-main border border-transparent"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-text-main/50" />
          ) : (
            <Moon className="w-4 h-4 text-text-main/50" />
          )}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}