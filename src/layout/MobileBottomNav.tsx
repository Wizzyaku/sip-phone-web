import { NavLink, useLocation } from 'react-router-dom';
import { Home, Phone, MessageSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const items = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Phone, label: 'Calls', path: '/calls' },
  { icon: MessageSquare, label: 'SMS', path: '/messages' },
  { icon: Settings, label: 'Settings', path: '/settings' },
] as const;

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-2 md:hidden pointer-events-none">
      <nav className="pointer-events-auto flex h-14 w-full max-w-sm items-center justify-between gap-1 rounded-2xl border border-border/40 bg-background/80 px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/' || location.pathname === '/dashboard'
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={cn(
                'group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-all duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-primary/10 transition-opacity duration-300" />
              )}
              <Icon
                className={cn(
                  'relative z-10 h-[18px] w-[18px] transition-transform duration-300',
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                )}
              />
              <span
                className={cn(
                  'relative z-10 text-[9px] font-bold tracking-wide transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-px h-0.5 w-6 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
