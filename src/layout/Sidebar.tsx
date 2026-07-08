import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Phone, MessageSquare, Contact, Settings, PhoneCall } from 'lucide-react';
import { useAppStore, unreadMessages } from '../store/appStore';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
  { id: 'contacts', label: 'Contacts', icon: Contact, path: '/contacts' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
] as const;

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const user = useAppStore((s) => s.user);
  const unreadMsgCount = useAppStore(unreadMessages);
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PhoneCall className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold">CloudTalk</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/' || location.pathname === '/dashboard'
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const badgeCount = item.id === 'messages' ? unreadMsgCount : 0;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {item.label}
              </div>
              {badgeCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[1.25rem] justify-center px-1.5 text-[10px]">
                  {badgeCount}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
          <Avatar className="h-9 w-9 bg-primary text-primary-foreground">
            <AvatarFallback>{user.avatar}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
