import { NavLink, useLocation } from 'react-router-dom';
import { Home, Phone, MessageSquare, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

const items = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Phone, label: 'Calls', path: '/calls' },
  { icon: MessageSquare, label: 'SMS', path: '/messages' },
  { icon: MoreHorizontal, label: 'More', path: '/settings' },
] as const;

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around rounded-t-xl bg-sky-100 shadow-[0_-10px_30px_rgba(91,91,214,0.08)] md:hidden dark:bg-sky-900">
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
              'flex flex-col items-center justify-center rounded-xl px-3 py-1 text-xs font-medium transition-all',
              isActive
                ? 'scale-95 bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
