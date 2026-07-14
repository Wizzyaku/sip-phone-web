import { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  PhoneCall,
  PlusSquare,
  Wallet,
  Grid3X3,
  Settings,
  Coins,
  PlusCircle,
  RefreshCw,
  PieChart,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  MessageSquare,
  PhoneOutgoing,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatTokens } from '../lib/balance';
import { cn } from '../lib/utils';

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildTrend() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const counts = days.map(() => Math.floor(Math.random() * 80) + 20); // mock data
  const max = 100;
  return { days, counts, max };
}

export function Dashboard() {
  const messages = useAppStore((s) => s.messages);
  const conversations = useAppStore((s) => s.conversations);
  const user = useAppStore((s) => s.user);
  const balance = useAppStore((s) => s.balance);
  const balanceLoading = useAppStore((s) => s.balanceLoading);
  const navigate = useNavigate();

  const trend = useMemo(() => buildTrend(), []);

  const activity = useMemo(() => {
    if (messages.length === 0) {
      return [
        { id: '1', title: '+1 (555) 234-5678', description: 'In • 2m 45s', time: '10:42', type: 'incoming' },
        { id: '2', title: 'Unknown Caller', description: 'Missed', time: '09:15', type: 'missed' },
        { id: '3', title: 'Sarah Johnson', description: '"Meeting at 2pm..."', time: '1d', type: 'message' },
        { id: '4', title: '+44 20 7946 0958', description: 'Out • 14m 12s', time: '1d', type: 'outgoing' },
      ];
    }
    return messages.slice(0, 6).map((m, i) => {
      const isInbound = m.direction === 'inbound';
      const isSms = m.type === 'text';
      let type = isSms ? 'message' : (isInbound ? 'incoming' : 'outgoing');
      let description = '';
      if (isSms) description = `"${m.body.substring(0, 15)}..."`;
      else if (type === 'incoming') description = 'In • 2m 45s';
      else description = 'Out • 14m 12s';
      
      if (i === 2 && !isSms) {
         type = 'missed';
         description = 'Missed';
      }

      return {
        id: m.id,
        title: isInbound ? m.from || m.conversationId : m.to || m.conversationId,
        description,
        time: formatTime(m.createdAt),
        type,
      };
    });
  }, [messages]);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-24 md:p-6 md:pb-6 bg-background/40">
      
      {/* Compact Dashboard Welcome Header */}
      <div className="mb-4 md:mb-8 flex flex-row items-end justify-between gap-2 md:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-3xl font-bold text-foreground tracking-tight truncate">Welcome back, {user.name}</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-tight truncate">Workspace overview for {today}.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-card border border-border/50 rounded-xl text-primary font-semibold shadow-sm hover:bg-accent transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </button>
          <button 
            onClick={() => navigate('/calls')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 md:px-4 md:py-2 bg-primary text-primary-foreground rounded-lg md:rounded-xl font-semibold shadow-md hover:shadow-lg active:scale-95 text-sm transition-all"
          >
            <PhoneCall className="w-[18px] h-[18px] md:w-5 md:h-5" />
            <span className="hidden sm:inline">New Outbound</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 md:mb-8">
        <h4 className="font-bold text-sm md:text-base text-foreground mb-2 md:mb-4">Quick Actions</h4>
        <div className="grid grid-cols-4 gap-2 md:gap-6">
          <button onClick={() => navigate('/settings')} className="bg-card border border-border/50 p-2 md:p-4 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-3 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusSquare className="w-[18px] h-[18px] md:w-6 md:h-6" />
            </div>
            <span className="text-[9px] md:text-xs text-foreground font-medium whitespace-nowrap">Buy Num</span>
          </button>
          <button onClick={() => navigate('/billing')} className="bg-card border border-border/50 p-2 md:p-4 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-3 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-[18px] h-[18px] md:w-6 md:h-6" />
            </div>
            <span className="text-[9px] md:text-xs text-foreground font-medium whitespace-nowrap">Recharge</span>
          </button>
          <button onClick={() => navigate('/calls')} className="bg-card border border-border/50 p-2 md:p-4 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-3 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Grid3X3 className="w-[18px] h-[18px] md:w-6 md:h-6" />
            </div>
            <span className="text-[9px] md:text-xs text-foreground font-medium whitespace-nowrap">Dialer</span>
          </button>
          <button onClick={() => navigate('/settings')} className="bg-card border border-border/50 p-2 md:p-4 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-3 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-[18px] h-[18px] md:w-6 md:h-6" />
            </div>
            <span className="text-[9px] md:text-xs text-foreground font-medium whitespace-nowrap">Apps</span>
          </button>
        </div>
      </div>

      {/* Tight Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
        {/* Token Balance Card */}
        <div className="col-span-2 md:col-span-1 glass-card rounded-xl p-3 md:p-6 flex flex-col justify-between min-h-[100px] md:h-[160px] relative overflow-hidden bg-card">
          <div className="flex justify-between items-center md:items-start z-10 mb-2 md:mb-0">
            <div>
              <p className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1 font-semibold">Token Balance</p>
              <div className="flex items-center gap-1.5 text-foreground">
                <Coins className="text-primary w-[22px] h-[22px] md:w-7 md:h-7" />
                <h3 className="font-bold text-2xl md:text-4xl leading-none">
                  {balanceLoading || balance === null ? (
                    <span className="inline-block h-6 w-16 animate-pulse rounded bg-muted" />
                  ) : (
                    formatTokens(balance.tokens)
                  )}
                </h3>
              </div>
            </div>
            <button onClick={() => navigate('/billing')} className="bg-primary text-primary-foreground text-[11px] md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-1 shadow-md hover:shadow-lg active:scale-95 transition-all">
              <PlusCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span>Top Up Credits</span>
            </button>
          </div>
          <div className="flex items-center gap-1 text-secondary font-semibold text-[11px] md:text-sm z-10">
            <RefreshCw className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
            <span>Auto-recharge at 2k</span>
          </div>
          {/* Background aesthetic graphic */}
          <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 opacity-20 pointer-events-none text-primary">
            <svg className="w-full h-full preserve-3d" viewBox="0 0 400 100">
              <path d="M0 80 Q 50 10, 100 70 T 200 40 T 300 80 T 400 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
            </svg>
          </div>
        </div>

        {/* Monthly Usage Card */}
        <div className="col-span-1 glass-card rounded-xl p-3 md:p-6 flex flex-col justify-between min-h-[100px] md:h-[160px] bg-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1 font-semibold">Monthly Usage</p>
              <h3 className="font-bold text-lg md:text-4xl text-foreground leading-tight">80%</h3>
            </div>
            <div className="relative flex items-center justify-center">
              <svg className="w-8 h-8 md:w-16 md:h-16 -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="12%" className="text-muted" />
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeDasharray="250" strokeDashoffset="50" strokeLinecap="round" strokeWidth="12%" className="text-primary" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] md:text-sm mt-2 md:mt-0 leading-tight">
            <PieChart className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Resets in 6 days</span>
          </div>
        </div>

        {/* Active Numbers Card */}
        <div className="col-span-1 glass-card rounded-xl p-3 md:p-6 flex flex-col justify-between min-h-[100px] md:h-[160px] bg-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1 font-semibold">Numbers</p>
              <h3 className="font-bold text-lg md:text-4xl text-foreground leading-tight">
                {Math.max(1, conversations.length)}
              </h3>
            </div>
            <div className="bg-secondary/10 text-secondary p-1.5 md:p-2 rounded-lg">
              <Phone className="w-[18px] h-[18px] md:w-6 md:h-6" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-1 md:gap-2 mt-2 md:mt-0">
            <div className="flex -space-x-2">
              <img className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-background object-cover bg-muted" src={`https://api.dicebear.com/7.x/flags/svg?seed=US`} alt="US" />
              <img className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-background object-cover bg-muted" src={`https://api.dicebear.com/7.x/flags/svg?seed=GB`} alt="UK" />
            </div>
            <span className="text-muted-foreground text-[10px] md:text-sm self-start">+5 regions</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        
        {/* Consumption Analytics Card */}
        <div className="lg:col-span-2 glass-card rounded-xl p-3 md:p-6 flex flex-col gap-2 md:gap-6 h-[220px] md:h-[480px] bg-card">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h4 className="font-bold text-sm md:text-xl text-foreground">Consumption</h4>
              <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">Usage volume across all services this week</p>
            </div>
            <div className="flex bg-muted rounded-md md:rounded-lg p-0.5 md:p-1">
              <button className="px-2 py-1 md:px-4 md:py-1.5 bg-background rounded shadow-sm text-[10px] md:text-xs text-primary font-medium">Wk</button>
              <button className="px-2 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs text-muted-foreground hover:text-foreground">Mo</button>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-1 md:gap-4 pt-2 md:pt-8 px-1 md:px-4">
            {trend.counts.map((count, i) => {
              const height = `${(count / trend.max) * 100}%`;
              const bgClass = count > 70 ? 'bg-primary/80' : count > 40 ? 'bg-primary/60' : 'bg-primary/20';
              return (
                <div key={i} className="flex flex-col items-center gap-1 md:gap-3 flex-1 h-full justify-end">
                  <div className={cn("w-full rounded-t-md transition-all hover:bg-primary", bgClass)} style={{ height }} />
                  <span className="text-[9px] md:text-xs font-medium text-muted-foreground">{trend.days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="glass-card rounded-xl p-3 md:p-6 flex flex-col h-[280px] md:h-[480px] bg-card">
          <div className="flex justify-between items-center mb-2 md:mb-6">
            <h4 className="font-bold text-sm md:text-xl text-foreground">Recent Activity</h4>
            <button onClick={() => navigate('/messages')} className="text-primary text-[10px] md:text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 md:space-y-4 pr-1">
            {activity.map((item) => {
              let Icon = Phone;
              let bgClass = 'bg-primary/10 text-primary';
              
              if (item.type === 'incoming') { Icon = PhoneIncoming; bgClass = 'bg-primary/10 text-primary'; }
              if (item.type === 'missed') { Icon = PhoneMissed; bgClass = 'bg-destructive/10 text-destructive'; }
              if (item.type === 'message') { Icon = MessageSquare; bgClass = 'bg-primary/10 text-primary'; }
              if (item.type === 'outgoing') { Icon = PhoneOutgoing; bgClass = 'bg-primary/10 text-primary'; }

              return (
                <div key={item.id} className="flex items-center gap-2 md:gap-4 p-1.5 md:p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors" onClick={() => navigate('/messages')}>
                  <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0", bgClass)}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-foreground font-semibold truncate">{item.title}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <p className="text-[9px] md:text-xs text-muted-foreground shrink-0">{item.time}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

export default memo(Dashboard);
