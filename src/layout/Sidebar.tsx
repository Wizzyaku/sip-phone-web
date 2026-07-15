import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  MessageSquare,
  Phone,
  Contact,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  PhoneCall,
} from 'lucide-react';
import { useAppStore, unreadMessages } from '../store/appStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'numbers', label: 'Phone Numbers', icon: Smartphone, path: '/numbers' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
  { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
  { id: 'contacts', label: 'Contacts', icon: Contact, path: '/contacts' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
  { id: 'usage', label: 'Usage', icon: BarChart3, path: '/usage' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
] as const;

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const unreadMsgCount = useAppStore(unreadMessages);
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="relative flex h-full w-[280px] flex-col overflow-hidden border-r border-white/20 bg-white/20 py-4 px-4 backdrop-blur-xl lg:fixed lg:left-0 lg:top-0 lg:h-screen">
      <div className="mb-4 px-2 hidden lg:block">
        <div className="flex items-center gap-2 text-primary">
          <PhoneCall className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold leading-tight">CloudTalk</h1>
            <p className="text-[11px] text-muted-foreground">Enterprise Tier</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
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
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'active-nav-indicator bg-primary/5 text-primary'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[1.25rem] justify-center px-1.5 text-[10px]">
                  {badgeCount}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-white/20 pt-3">
        <Button className="w-full rounded-lg shadow-lg shadow-primary/20 mb-2 h-9" onClick={() => navigate('/settings')}>
          Buy Number
        </Button>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10',
            location.pathname.startsWith('/settings') && 'text-primary bg-primary/5'
          )}
        >
          <HelpCircle className="h-[18px] w-[18px]" />
          Help
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
