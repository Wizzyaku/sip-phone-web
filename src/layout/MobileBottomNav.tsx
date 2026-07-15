import { NavLink, useLocation } from 'react-router-dom';
import { Home, Phone, MessageSquare, MoreHorizontal, Grid3X3 } from 'lucide-react';
import { cn } from '../lib/utils';

export function MobileBottomNav() {
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '/dashboard';
  const isCalls = location.pathname.startsWith('/calls');
  const isMessages = location.pathname.startsWith('/messages');
  const isMore = location.pathname.startsWith('/settings');

  return (
    <nav
      className="fixed bottom-0 w-full h-[64px] md:hidden backdrop-blur-2xl z-50 rounded-t-2xl border-t border-border/20 bg-card flex justify-around items-center px-2 shadow-[0_-15px_40px_rgba(91,91,214,0.1)]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <NavLink to="/" className={cn("flex flex-col items-center justify-center w-16 transition-colors", isHome ? "text-primary" : "text-muted-foreground hover:text-primary")}>
        <Home className={cn("w-[22px] h-[22px] mb-0.5", isHome && "fill-primary")} />
        <span className="text-[9px] font-semibold tracking-wide">Home</span>
      </NavLink>

      <NavLink to="/calls" className={cn("flex flex-col items-center justify-center w-16 transition-colors", isCalls ? "text-primary" : "text-muted-foreground hover:text-primary")}>
        <Phone className="w-[22px] h-[22px] mb-0.5" />
        <span className="text-[9px] font-medium tracking-wide">Calls</span>
      </NavLink>

      {/* Center Floating Action Button */}
      <NavLink to="/calls" className="flex flex-col items-center justify-center -mt-6 relative z-10">
        <div className="w-[48px] h-[48px] bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(66,65,188,0.4)] active:scale-95 transition-transform border-4 border-background">
          <Grid3X3 className="w-6 h-6" />
        </div>
      </NavLink>

      <NavLink to="/messages" className={cn("flex flex-col items-center justify-center w-16 transition-colors", isMessages ? "text-primary" : "text-muted-foreground hover:text-primary")}>
        <MessageSquare className="w-[22px] h-[22px] mb-0.5" />
        <span className="text-[9px] font-medium tracking-wide">SMS</span>
      </NavLink>

      <NavLink to="/settings" className={cn("flex flex-col items-center justify-center w-16 transition-colors", isMore ? "text-primary" : "text-muted-foreground hover:text-primary")}>
        <MoreHorizontal className="w-[22px] h-[22px] mb-0.5" />
        <span className="text-[9px] font-medium tracking-wide">More</span>
      </NavLink>
    </nav>
  );
}
