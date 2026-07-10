import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Menu, Check, X, Wallet } from 'lucide-react';
import { useAppStore, unreadCount } from '../store/appStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const setTheme = useAppStore((s) => s.setTheme);
  const notifications = useAppStore((s) => s.notifications);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const dismiss = useAppStore((s) => s.dismissNotification);
  const user = useAppStore((s) => s.user);
  const unread = useAppStore(unreadCount);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/20 bg-sky-100/90 px-4 backdrop-blur-md dark:bg-sky-900/90 lg:w-[calc(100%-280px)] lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden w-full max-w-md lg:block">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search numbers or logs..."
            className="h-10 rounded-full border border-border bg-card pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink
            to="/billing"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors',
                isActive ? 'border-b-2 border-primary pb-1 text-primary' : 'text-muted-foreground hover:text-primary'
              )
            }
          >
            <Wallet className="h-4 w-4" />
            Tokens: 12,000
          </NavLink>
        </nav>

        <div className="relative" ref={panelRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-muted"
            aria-label="Notifications"
            onClick={() => setOpen((o) => !o)}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />}
          </Button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card p-2 shadow-lg">
              <div className="flex items-center justify-between border-b px-2 pb-2">
                <p className="text-sm font-semibold">Notifications</p>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                  Mark all read
                </Button>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-2 rounded-md px-2 py-2 transition-colors',
                        n.read ? 'opacity-60' : 'bg-accent/50'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!n.read && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markRead(n.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismiss(n.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={toggleTheme} aria-label="Toggle theme">
          {resolvedTheme === 'dark' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
        </Button>

        <div className="hidden h-8 w-px bg-border lg:block" />

        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 bg-primary text-primary-foreground shadow-sm">
            <AvatarFallback>{user.avatar}</AvatarFallback>
          </Avatar>
          <span className="hidden font-medium text-sm xl:inline">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
