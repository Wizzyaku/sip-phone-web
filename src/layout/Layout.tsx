import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { SipProvider } from '../context/SipContext';
import { cn } from '../lib/utils';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SipProvider>
      <div className="flex min-h-screen dashboard-gradient">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className={cn('absolute left-0 top-0 h-full w-[280px] bg-card shadow-xl')}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col lg:ml-[280px]">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-auto px-4 lg:px-6 pt-[74px] pb-24 lg:pb-6">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SipProvider>
  );
}
