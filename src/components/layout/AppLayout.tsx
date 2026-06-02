import React from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md relative flex flex-col min-h-screen">
        <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-20' : ''}`}>
          {children}
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: () => void;
  transparent?: boolean;
}

export function PageHeader({ title, subtitle, right, back, transparent = false }: PageHeaderProps) {
  return (
    <div className={`sticky top-0 z-30 px-4 py-4 flex items-center gap-3 ${transparent ? 'bg-transparent' : 'bg-white border-b border-gray-100'}`}>
      {back && (
        <button onClick={back} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
