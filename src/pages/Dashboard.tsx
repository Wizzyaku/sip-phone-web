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
  ArrowUpRight,
  TrendingUp,
  Activity
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
  const user = useAppStore((s) => s.user);
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 bg-background/30 w-full relative">
      
      {/* Decorative premium background blur */}
      <div className="absolute top-0 right-0 w-1/2 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Modern Dashboard Welcome Header */}
      <div className="hidden md:flex mb-8 flex-row items-end justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-primary font-bold tracking-wider uppercase mb-1">{today}</p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight truncate">Welcome back, {user.name}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed truncate max-w-2xl">Here is what's happening with your workspace today. You have {conversations.length} active numbers.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border/50 rounded-xl text-foreground font-semibold shadow-sm hover:border-primary/30 transition-all hover:bg-accent group">
            <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Schedule</span>
          </button>
          <button 
            onClick={() => navigate('/calls')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            <span>New Outbound</span>
          </button>
        </div>
      </div>

      {/* Premium Quick Actions */}
      <div className="mb-6 md:mb-10">
        <h4 className="font-bold text-xs md:text-sm text-muted-foreground uppercase tracking-widest mb-3 md:mb-5">Quick Actions</h4>
        <div className="grid grid-cols-4 gap-3 md:gap-5">
          {[
            { icon: PlusSquare, label: 'Buy Number', path: '/numbers/buy', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: Wallet, label: 'Recharge', path: '/billing', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Grid3X3, label: 'Dialer', path: '/calls', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Settings, label: 'Settings', path: '/settings', color: 'text-orange-500', bg: 'bg-orange-500/10' }
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)} className="bg-background/80 backdrop-blur-xl border border-border/50 p-3 md:p-5 rounded-[1.5rem] flex flex-col items-center gap-2 md:gap-4 hover:border-primary/30 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1", action.bg, action.color)}>
                <action.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-sm text-foreground font-bold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
        {/* Token Balance Card */}
        <div className="col-span-1 glass-card rounded-[1.5rem] p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:h-[180px] relative overflow-hidden bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="text-primary w-4 h-4 md:w-5 md:h-5" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Token Balance</p>
              </div>
              <h3 className="font-extrabold text-3xl md:text-5xl tracking-tight text-foreground mt-1">
                {balanceLoading || balance === null ? (
                  <span className="inline-block h-8 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  formatTokens(balance.tokens)
                )}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between z-10 mt-4 md:mt-0">
            <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold bg-secondary/10 px-2 py-1 rounded-md">
              <RefreshCw className="w-3 h-3" />
              <span>Auto-recharge at 2k</span>
            </div>
            <button onClick={() => navigate('/billing')} className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-full hover:bg-primary/10">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          {/* Aesthetic background wave */}
          <div className="absolute -bottom-4 left-0 right-0 h-24 opacity-10 text-primary pointer-events-none transition-transform duration-700 group-hover:translate-y-2">
            <svg className="w-full h-full preserve-3d" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 60 Q 100 0, 200 60 T 400 40 L 400 100 L 0 100 Z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Monthly Usage Card */}
        <div className="col-span-1 glass-card rounded-[1.5rem] p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:h-[180px] bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="text-emerald-500 w-4 h-4 md:w-5 md:h-5" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Monthly Usage</p>
              </div>
              <h3 className="font-extrabold text-3xl md:text-5xl tracking-tight text-foreground mt-1">80<span className="text-2xl md:text-3xl text-muted-foreground">%</span></h3>
            </div>
            <div className="relative flex items-center justify-center bg-background rounded-full p-1 shadow-inner">
              <svg className="w-12 h-12 md:w-14 md:h-14 -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="15%" className="text-muted" />
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeDasharray="250" strokeDashoffset="50" strokeLinecap="round" strokeWidth="15%" className="text-emerald-500" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-4 md:mt-0 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Resets in 6 days</span>
          </div>
        </div>

        {/* Active Numbers Card */}
        <div className="col-span-1 glass-card rounded-[1.5rem] p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:h-[180px] bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="text-blue-500 w-4 h-4 md:w-5 md:h-5" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Active Numbers</p>
              </div>
              <h3 className="font-extrabold text-3xl md:text-5xl tracking-tight text-foreground mt-1">
                {Math.max(1, conversations.length)}
              </h3>
            </div>
            <div className="bg-blue-500/10 text-blue-600 p-2 rounded-xl">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 md:mt-0">
            <div className="flex -space-x-2">
              <img className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-background object-cover bg-muted z-20" src={`https://api.dicebear.com/7.x/flags/svg?seed=US`} alt="US" />
              <img className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-background object-cover bg-muted z-10" src={`https://api.dicebear.com/7.x/flags/svg?seed=GB`} alt="UK" />
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] md:text-[10px] font-bold text-muted-foreground z-0">+5</div>
            </div>
            <span className="text-primary text-xs font-semibold hover:underline cursor-pointer">Manage</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Finer Consumption Analytics Card */}
        <div className="lg:col-span-2 glass-card rounded-[1.5rem] p-5 md:p-8 flex flex-col h-[300px] md:h-[450px] bg-background/80 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start md:items-center mb-6 z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="font-extrabold text-lg md:text-xl text-foreground">Usage Analytics</h4>
              </div>
              <p className="text-xs text-muted-foreground hidden md:block font-medium">Communication volume breakdown (Voice vs SMS)</p>
            </div>
            <div className="flex bg-muted/50 border border-border/50 rounded-lg p-1 shadow-inner">
              <button className="px-3 py-1 md:px-4 md:py-1.5 bg-background rounded-md shadow-sm text-xs text-primary font-bold transition-all">Week</button>
              <button className="px-3 py-1 md:px-4 md:py-1.5 text-xs text-muted-foreground font-medium hover:text-foreground transition-all">Month</button>
            </div>
          </div>

          <div className="flex gap-4 mb-4 z-10 justify-end md:justify-start">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Voice
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/50" /> SMS
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 px-1 md:px-2 z-10 pb-2">
            {trend.voiceCounts.map((voiceCount, i) => {
              const smsCount = trend.smsCounts[i];
              const voiceHeight = `${(voiceCount / trend.max) * 100}%`;
              const smsHeight = `${(smsCount / trend.max) * 100}%`;
              const isToday = i === trend.days.length - 1;
              
              return (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                  <div className="w-full max-w-[40px] flex flex-col justify-end h-full gap-1 rounded-t-lg overflow-hidden relative cursor-pointer">
                    <div className="absolute inset-0 bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                    <div 
                      className={cn("w-full rounded-md transition-all duration-500", isToday ? "bg-blue-400" : "bg-blue-400/60 group-hover:bg-blue-400/80")} 
                      style={{ height: smsHeight }} 
                    />
                    <div 
                      className={cn("w-full rounded-md transition-all duration-500", isToday ? "bg-primary" : "bg-primary/60 group-hover:bg-primary/80")} 
                      style={{ height: voiceHeight }} 
                    />
                  </div>
                  <span className={cn("text-xs font-bold transition-colors", isToday ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                    {trend.days[i]}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Faint grid lines for analytics backdrop */}
          <div className="absolute inset-0 top-[120px] bottom-[40px] flex flex-col justify-between px-8 z-0 pointer-events-none">
            {[1,2,3,4].map((i) => (
              <div key={i} className="w-full border-t border-border/30 border-dashed" />
            ))}
          </div>
        </div>

        {/* Premium Recent Activity Sidebar */}
        <div className="glass-card rounded-[1.5rem] p-5 md:p-6 flex flex-col h-[300px] md:h-[450px] bg-background/80 border border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h4 className="font-extrabold text-lg md:text-xl text-foreground">Recent Activity</h4>
            <button onClick={() => navigate('/messages')} className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {activity.map((item) => {
              let Icon = Phone;
              let bgClass = 'bg-primary/10 text-primary border border-primary/20';
              
              if (item.type === 'incoming') { Icon = PhoneIncoming; bgClass = 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'; }
              if (item.type === 'missed') { Icon = PhoneMissed; bgClass = 'bg-destructive/10 text-destructive border border-destructive/20'; }
              if (item.type === 'message') { Icon = MessageSquare; bgClass = 'bg-blue-500/10 text-blue-600 border border-blue-500/20'; }
              if (item.type === 'outgoing') { Icon = PhoneOutgoing; bgClass = 'bg-primary/10 text-primary border border-primary/20'; }

              return (
                <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 rounded-2xl bg-card border border-border/30 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all active:scale-[0.98]" onClick={() => navigate('/messages')}>
                  <div className={cn("w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", bgClass)}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-bold truncate mb-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-medium truncate">{item.description}</p>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-semibold shrink-0 bg-muted px-2 py-1 rounded-md">{item.time}</p>
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
