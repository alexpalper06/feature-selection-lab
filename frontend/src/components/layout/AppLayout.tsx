// src/components/layout/AppLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import Header, { type BreadcrumbItem } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps): React.ReactElement {
  return (
    <div className=" bg-bg-main text-text-main flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <Header breadcrumbs={breadcrumbs} />

        <main className="flex-1 p-8 bg-bg-main">
          {children}
        </main>

      </div>
    </div>
  );
}