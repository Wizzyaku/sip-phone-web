import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { SipProvider } from '../context/SipContext';
import { cn } from '../lib/utils';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <SipProvider>
      <div className="flex min-h-screen dashboard-gradient">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none lg:hidden">
            <div className="absolute top-16 h-[calc(100%-4rem)] w-full bg-black/50 pointer-events-auto" onClick={() => setMobileOpen(false)} />
            <div className={cn('absolute left-0 top-16 h-[calc(100%-4rem-64px)] w-[280px] shadow-xl pointer-events-auto')}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col lg:ml-[280px]">
          <Header onMenuClick={() => setMobileOpen((open) => !open)} />
          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-[10px] md:px-4 lg:px-6 pt-16 lg:pt-[74px] pb-[74px] md:pb-6">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SipProvider>
  );
}
