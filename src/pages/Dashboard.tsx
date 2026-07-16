import { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusSquare,
  Wallet,
  Grid3X3,
  Settings2,
  PlusCircle,
  RefreshCw,
  PieChart,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  MessageSquare,
  PhoneOutgoing,
  Ticket,
  TrendingUp,
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
    <div className="flex-1 overflow-y-auto custom-scrollbar md:p-6 md:pb-6 w-full relative">

      {/* Premium Token Balance Card */}
      <div className="mb-3 md:mb-8">
        <div className="rounded-[1rem] md:rounded-[1.5rem] p-3 md:p-5 flex flex-col justify-between min-h-[96px] md:h-[160px] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-primary to-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group border border-primary/20">
          {/* Decorative glowing orb */}
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-[20px] md:blur-[40px] -mr-8 -mt-8 pointer-events-none" />
          
          <div className="flex flex-row items-start justify-between z-10 gap-2">
            <div>
              <p className="text-white/70 text-[9px] md:text-xs uppercase tracking-widest mb-1 font-bold flex items-center gap-1 md:gap-1.5">
                <Wallet className="w-3 h-3 md:w-4 md:h-4" /> Total Balance
              </p>
              <div className="flex items-baseline gap-1 md:gap-1.5">
                <h3 className="font-black text-2xl md:text-4xl leading-none tracking-tight">
                  {balanceLoading || balance === null ? (
                    <span className="inline-block h-6 w-20 md:h-8 md:w-28 animate-pulse rounded bg-white/20" />
                  ) : (
                    formatTokens(balance.tokens)
                  )}
                </h3>
                <span className="text-white/70 text-[10px] md:text-sm font-semibold mb-0.5">TKNS</span>
              </div>
            </div>
            
            <button onClick={() => navigate('/billing')} className="shrink-0 bg-white/10 hover:bg-white text-white hover:text-primary text-[10px] md:text-sm font-bold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/20 hover:border-white shadow-sm active:scale-95 transition-all">
              <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline">Add Funds</span>
              <span className="inline md:hidden">Top Up</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between z-10 mt-3 md:mt-0">
            <div className="flex items-center gap-1 md:gap-1.5 text-white/80 font-medium text-[9px] md:text-xs bg-black/15 px-2 py-1 md:px-2.5 md:py-1.5 rounded-md backdrop-blur-sm border border-white/5">
              <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span>Auto-topup at 2,000</span>
            </div>
          </div>
          
          {/* Aesthetic background wave */}
          <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 opacity-[0.15] pointer-events-none transition-transform duration-700 group-hover:translate-y-1">
            <svg className="w-full h-full preserve-3d" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 60 Q 100 0, 200 60 T 400 40 L 400 100 L 0 100 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-3 md:mb-8">
        <h4 className="font-bold text-xs md:text-base text-muted-foreground mb-1.5 md:mb-4 uppercase md:normal-case tracking-wide md:tracking-normal">Quick Actions</h4>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-6">
          {[
            { icon: PlusSquare, label: 'Buy Num', path: '/numbers/buy', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: Wallet, label: 'Recharge', path: '/billing', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: Grid3X3, label: 'Dialer', path: '/calls', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
            { icon: Settings2, label: 'Apps', path: '/settings', mobile: false, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)} className={cn("glass-card p-2 md:p-5 rounded-[1rem] md:rounded-[1.5rem] flex flex-col items-center gap-1.5 md:gap-4 hover:bg-background shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group relative overflow-hidden", action.mobile === false && "hidden md:flex")}>
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className={cn("w-9 h-9 md:w-14 md:h-14 rounded-[0.8rem] md:rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform duration-500", action.bg, action.color)}>
                <action.icon className="w-4 h-4 md:w-6 md:h-6 drop-shadow-sm" />
              </div>
              
              <span className="text-[10px] md:text-sm text-foreground font-bold tracking-tight whitespace-nowrap z-10">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-1.5 md:gap-6 mb-3 md:mb-8">
        {/* Premium Monthly Usage Card */}
        <div className="col-span-1 glass-card rounded-[1rem] md:rounded-[1.5rem] p-3 md:p-5 flex flex-col justify-between min-h-[96px] md:h-[160px] border border-border/50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-muted-foreground text-[9px] md:text-xs uppercase tracking-widest mb-1 font-bold flex items-center gap-1 md:gap-1.5">
                <PieChart className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" /> Usage
              </p>
              <div className="flex items-baseline gap-0.5 md:gap-1">
                <h3 className="font-black text-xl md:text-4xl text-foreground leading-none tracking-tight">80</h3>
                <span className="text-sm md:text-xl text-muted-foreground font-bold">%</span>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center shrink-0">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-8 h-8 md:w-14 md:h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-muted/30"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  {/* Progress Circle (80%) */}
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                    strokeDasharray="80, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 z-10 mt-3 md:mt-0 bg-muted/40 self-start px-2 py-1 md:px-2.5 md:py-1.5 rounded-md border border-border/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            <span className="text-muted-foreground text-[9px] md:text-xs font-medium">Resets in 6 days</span>
          </div>
        </div>

        {/* Premium Active Numbers Card */}
        <div className="col-span-1 glass-card rounded-[1rem] md:rounded-[1.5rem] p-3 md:p-5 flex flex-col justify-between min-h-[96px] md:h-[160px] border border-border/50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-muted-foreground text-[9px] md:text-xs uppercase tracking-widest mb-1 font-bold flex items-center gap-1 md:gap-1.5">
                <Ticket className="w-3 h-3 md:w-4 md:h-4 text-blue-500" /> Active
              </p>
              <h3 className="font-black text-xl md:text-4xl text-foreground leading-none tracking-tight">
                {Math.max(1, conversations.length)}
              </h3>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 p-1.5 md:p-2.5 rounded-lg md:rounded-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between z-10 mt-3 md:mt-0">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="flex -space-x-1.5 md:-space-x-2">
                <img className="w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-background object-cover bg-muted z-20 shadow-sm" src="https://api.dicebear.com/7.x/flags/svg?seed=US" alt="US" />
                <img className="w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-background object-cover bg-muted z-10 shadow-sm" src="https://api.dicebear.com/7.x/flags/svg?seed=GB" alt="UK" />
                <div className="w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] md:text-[10px] font-bold text-muted-foreground z-0 shadow-sm">
                  +5
                </div>
              </div>
            </div>
            
            <button onClick={() => navigate('/numbers')} className="text-primary text-[9px] md:text-xs font-bold hover:underline opacity-80 hover:opacity-100 transition-opacity">
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
        
        {/* Premium Consumption Analytics Card */}
        <div className="lg:col-span-2 glass-card rounded-[1rem] md:rounded-[1.5rem] p-3 md:p-6 flex flex-col h-[220px] md:h-[450px] border border-border/50 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start md:items-center mb-2 md:mb-6 z-10">
            <div>
              <div className="flex items-center gap-1.5 md:gap-2 mb-0 md:mb-1">
                <div className="p-1 md:p-1.5 rounded-md bg-primary/10 text-primary">
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </div>
                <h4 className="font-extrabold text-sm md:text-xl text-foreground tracking-tight">Usage Analytics</h4>
              </div>
              <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block font-medium">Daily breakdown of your communication volume</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex bg-muted/50 border border-border/50 rounded-lg p-0.5 shadow-inner">
                <button className="px-2 py-0.5 md:px-4 md:py-1.5 bg-background rounded-md shadow-sm text-[10px] md:text-xs text-primary font-bold transition-all">7 Days</button>
                <button className="px-2 py-0.5 md:px-4 md:py-1.5 text-[10px] md:text-xs text-muted-foreground font-medium hover:text-foreground transition-all">30 Days</button>
              </div>
              
              <div className="hidden md:flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-primary shadow-sm" /> Voice
                </div>
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-blue-400 shadow-sm" /> SMS
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 px-1 md:px-4 z-10 pb-1 md:pb-2 mt-2">
            {trend.voiceCounts.map((voiceCount, i) => {
              const smsCount = trend.smsCounts[i];
              const voiceHeight = `${(voiceCount / trend.max) * 100}%`;
              const smsHeight = `${(smsCount / trend.max) * 100}%`;
              const isToday = i === trend.days.length - 1;
              const total = voiceCount + smsCount;
              
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 md:gap-3 flex-1 h-full justify-end group/bar relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 md:-top-14 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-foreground text-background text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-xl flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                    <span>{total} Total</span>
                    <span className="text-background/70 font-medium text-[8px] md:text-[10px]">{voiceCount} Voice • {smsCount} SMS</span>
                    <div className="absolute -bottom-1 w-2 h-2 bg-foreground rotate-45" />
                  </div>
                  
                  <div className="w-full max-w-[20px] md:max-w-[40px] flex flex-col justify-end h-full gap-0.5 md:gap-1 rounded-t-[4px] md:rounded-t-lg overflow-hidden relative cursor-pointer hover:scale-x-110 transition-transform origin-bottom">
                    <div className="absolute inset-0 bg-muted/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                    
                    {/* SMS Segment */}
                    <div 
                      className={cn("w-full rounded-sm md:rounded-md transition-all duration-700", isToday ? "bg-blue-400" : "bg-blue-400/50 group-hover/bar:bg-blue-400/80")} 
                      style={{ height: smsHeight }} 
                    />
                    {/* Voice Segment */}
                    <div 
                      className={cn("w-full rounded-sm md:rounded-md transition-all duration-700", isToday ? "bg-primary" : "bg-primary/50 group-hover/bar:bg-primary/80")} 
                      style={{ height: voiceHeight }} 
                    />
                  </div>
                  
                  <span className={cn("text-[9px] md:text-xs font-bold transition-colors", isToday ? "text-primary" : "text-muted-foreground group-hover/bar:text-foreground")}>
                    {trend.days[i]}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Faint grid lines & labels for Y-axis backdrop */}
          <div className="absolute inset-0 top-[70px] md:top-[100px] bottom-[28px] md:bottom-[40px] flex flex-col justify-between px-3 md:px-6 z-0 pointer-events-none">
            {[trend.max, Math.floor(trend.max * 0.75), Math.floor(trend.max * 0.5), Math.floor(trend.max * 0.25), 0].map((val, i) => (
              <div key={i} className="w-full border-t border-border/40 border-dashed relative">
                <span className="absolute -top-2 md:-top-2.5 -left-1 md:left-0 text-[8px] md:text-[10px] text-muted-foreground/50 font-medium">
                  {val > 0 ? val : ''}
                </span>
              </div>
            ))}
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
