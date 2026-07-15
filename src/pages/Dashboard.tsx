import { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusSquare,
  Wallet,
  Grid3X3,
  Settings2,
  Coins,
  PlusCircle,
  RefreshCw,
  PieChart,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  MessageSquare,
  PhoneOutgoing,
  Ticket,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatTokens } from '../lib/balance';
import { cn } from '../lib/utils';

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildTrend() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Finer trend details
  const voiceCounts = days.map(() => Math.floor(Math.random() * 60) + 10);
  const smsCounts = days.map(() => Math.floor(Math.random() * 40) + 5);
  const max = Math.max(...voiceCounts.map((v, i) => v + smsCounts[i])) + 10;
  return { days, voiceCounts, smsCounts, max };
}

export function Dashboard() {
  const messages = useAppStore((s) => s.messages);
  const conversations = useAppStore((s) => s.conversations);
  const balance = useAppStore((s) => s.balance);
  const balanceLoading = useAppStore((s) => s.balanceLoading);
  const navigate = useNavigate();

  const trend = useMemo(() => buildTrend(), []);

  const activity = useMemo(() => {
    if (messages.length === 0) {
      return [
        { id: '1', title: '+1 (555) 234-5678', description: 'Inbound • 2m 45s', time: '10:42 AM', type: 'incoming' },
        { id: '2', title: 'Unknown Caller', description: 'Missed Call', time: '09:15 AM', type: 'missed' },
        { id: '3', title: 'Sarah Johnson', description: 'SMS: "Meeting at 2pm..."', time: 'Yesterday', type: 'message' },
        { id: '4', title: '+44 20 7946 0958', description: 'Outbound • 14m 12s', time: 'Yesterday', type: 'outgoing' },
      ];
    }
    return messages.slice(0, 6).map((m, i) => {
      const isInbound = m.direction === 'inbound';
      const isSms = m.type === 'text';
      let type = isSms ? 'message' : (isInbound ? 'incoming' : 'outgoing');
      let description = '';
      if (isSms) description = `SMS: "${m.body.substring(0, 20)}..."`;
      else if (type === 'incoming') description = 'Inbound • 2m 45s';
      else description = 'Outbound • 14m 12s';
      
      if (i === 2 && !isSms) {
         type = 'missed';
         description = 'Missed Call';
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

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-24 md:p-6 md:pb-6 bg-background/40 w-full relative">

      {/* Quick Actions */}
      <div className="mb-3 md:mb-8">
        <h4 className="font-bold text-xs md:text-base text-muted-foreground mb-1.5 md:mb-4 uppercase md:normal-case tracking-wide md:tracking-normal">Quick Actions</h4>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-6">
          {[
            { icon: PlusSquare, label: 'Buy Num', path: '/numbers/buy' },
            { icon: Wallet, label: 'Recharge', path: '/billing' },
            { icon: Grid3X3, label: 'Dialer', path: '/calls' },
            { icon: Settings2, label: 'Apps', path: '/settings', mobile: false },
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)} className={cn("bg-background border border-border/30 p-2 md:p-4 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-3 hover:border-primary/40 shadow-sm transition-all active:scale-95", action.mobile === false && "hidden md:flex")}>
              <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <action.icon className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className="text-[9px] md:text-sm text-foreground font-medium whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-6 mb-3 md:mb-8">
        {/* Token Balance */}
        <div className="col-span-2 md:col-span-1 glass-card rounded-xl p-2.5 md:p-4 flex flex-col justify-between min-h-[92px] md:h-[160px] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0 sm:justify-between z-10">
            <div>
              <p className="text-muted-foreground text-[10px] md:text-sm uppercase tracking-wider mb-0.5 md:mb-1 font-semibold">Token Balance</p>
              <div className="flex items-center gap-1.5 text-foreground">
                <Coins className="text-primary w-5 h-5 md:w-7 md:h-7" />
                <h3 className="font-bold text-xl md:text-3xl leading-none">
                  {balanceLoading || balance === null ? (
                    <span className="inline-block h-6 w-20 animate-pulse rounded bg-muted" />
                  ) : (
                    formatTokens(balance.tokens)
                  )}
                </h3>
              </div>
            </div>
            <button onClick={() => navigate('/billing')} className="self-start bg-primary text-primary-foreground text-[11px] md:text-sm font-semibold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-1 shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0">
              <PlusCircle className="w-3.5 h-3.5 md:w-5 md:h-5" />
              <span className="hidden sm:inline md:hidden">Top Up</span>
              <span className="hidden md:inline">Top Up Credits</span>
              <span className="inline sm:hidden">Top Up</span>
            </button>
          </div>
          <div className="flex items-center gap-1 text-secondary font-semibold text-[10px] md:text-sm z-10 mt-1.5 md:mt-0">
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
            <span>Auto-recharge at 2k</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 md:h-16 opacity-20 pointer-events-none">
            <svg className="w-full h-full preserve-3d" viewBox="0 0 400 100"><path d="M0 80 Q 50 10, 100 70 T 200 40 T 300 80 T 400 20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="6" className="text-primary" /></svg>
          </div>
        </div>

        {/* Monthly Usage */}
        <div className="col-span-1 glass-card rounded-xl p-2.5 md:p-4 flex flex-col justify-between min-h-[92px] md:h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] md:text-sm uppercase tracking-wider mb-0.5 md:mb-1 font-semibold">Monthly Usage</p>
              <h3 className="font-bold text-base md:text-3xl text-foreground leading-tight">80<span className="text-sm md:text-2xl text-muted-foreground">%</span></h3>
            </div>
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 md:w-16 md:h-16 -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="12%" className="text-muted/30" />
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeDasharray="250" strokeDashoffset="50" strokeLinecap="round" strokeWidth="12%" className="text-primary" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-[9px] md:text-sm mt-1.5 md:mt-0 leading-tight">
            <PieChart className="w-3 h-3 md:w-4 md:h-4" />
            <span>Resets in 6 days</span>
          </div>
        </div>

        {/* Active Numbers */}
        <div className="col-span-1 glass-card rounded-xl p-2.5 md:p-4 flex flex-col justify-between min-h-[92px] md:h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] md:text-sm uppercase tracking-wider mb-0.5 md:mb-1 font-semibold">Numbers</p>
              <h3 className="font-bold text-base md:text-3xl text-foreground leading-tight">{Math.max(1, conversations.length)}</h3>
            </div>
            <div className="bg-secondary/10 text-secondary p-1.5 md:p-2 rounded-lg shrink-0">
              <Ticket className="w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 md:mt-0">
            <div className="flex -space-x-2">
              <img className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-background" src="https://api.dicebear.com/7.x/flags/svg?seed=US" alt="US" />
              <img className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-background" src="https://api.dicebear.com/7.x/flags/svg?seed=GB" alt="UK" />
            </div>
            <span className="text-muted-foreground text-[9px] md:text-sm">+5 regions</span>
          </div>
        </div>
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
        {/* Analytics */}
        <div className="lg:col-span-2 glass-card rounded-xl p-2.5 md:p-8 flex flex-col gap-1.5 md:gap-4 h-[190px] md:h-[480px]">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h4 className="font-bold text-xs md:text-lg text-foreground">Consumption</h4>
              <p className="text-[10px] md:text-base text-muted-foreground hidden md:block">Usage volume across all services this week</p>
            </div>
            <div className="flex bg-muted/30 rounded-md md:rounded-lg p-0.5 md:p-1">
              <button className="px-2 py-1 md:px-4 md:py-1 bg-background rounded shadow-sm text-[10px] md:text-sm text-primary font-medium">Wk</button>
              <button className="px-2 py-1 md:px-4 md:py-1 text-[10px] md:text-sm text-muted-foreground">Mo</button>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 pt-1.5 md:pt-8 px-1 md:px-4">
            {trend.voiceCounts.map((voiceCount, i) => {
              const smsCount = trend.smsCounts[i];
              const total = voiceCount + smsCount;
              const height = `${(total / trend.max) * 100}%`;
              const isToday = i === trend.days.length - 1;
              return (
                <div key={i} className="flex flex-col items-center gap-1 md:gap-2 flex-1 h-full justify-end">
                  <div
                    className={cn("w-full rounded-t-md transition-all duration-500", isToday ? "bg-primary" : "bg-primary/20")}
                    style={{ height }}
                  />
                  <span className="text-[9px] md:text-xs text-muted-foreground">{trend.days[i][0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-2.5 md:p-4 flex flex-col h-[240px] md:h-[480px]">
          <div className="flex justify-between items-center mb-1.5 md:mb-4">
            <h4 className="font-bold text-xs md:text-lg text-foreground">Recent Activity</h4>
            <button onClick={() => navigate('/messages')} className="text-primary text-[10px] md:text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 md:space-y-3 pr-1">
            {activity.map((item) => {
              let Icon = Phone;
              let bgClass = 'bg-primary/10 text-primary';
              if (item.type === 'incoming') { Icon = PhoneIncoming; bgClass = 'bg-orange-500/10 text-orange-600'; }
              if (item.type === 'missed') { Icon = PhoneMissed; bgClass = 'bg-destructive/10 text-destructive'; }
              if (item.type === 'message') { Icon = MessageSquare; bgClass = 'bg-primary/10 text-primary'; }
              if (item.type === 'outgoing') { Icon = PhoneOutgoing; bgClass = 'bg-primary/10 text-primary'; }
              return (
                <div key={item.id} className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg hover:bg-background/40 cursor-pointer transition-all" onClick={() => navigate('/messages')}>
                  <div className={cn("w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0", bgClass)}>
                    <Icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
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
