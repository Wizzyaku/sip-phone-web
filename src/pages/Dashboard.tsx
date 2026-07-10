import { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Coins,
  Phone,
  PlusCircle,
  Zap,
  Grid3X3,
  PhoneIncoming,
  MessageCircle,
  PhoneMissed,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildTrend(messages: ReturnType<typeof useAppStore.getState>['messages']) {
  const weeks = Array.from({ length: 12 }, (_, i) => i);
  const counts = weeks.map((weekOffset) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - (11 - weekOffset) * 7);
    const nextWeek = new Date(weekAgo);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return messages.filter((m) => {
      const t = new Date(m.createdAt);
      return t >= weekAgo && t < nextWeek;
    }).length;
  });
  const max = Math.max(1, ...counts);
  return { counts, max };
}

export function Dashboard() {
  const messages = useAppStore((s) => s.messages);
  const conversations = useAppStore((s) => s.conversations);
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();

  const trend = useMemo(() => buildTrend(messages), [messages]);

  const activity = useMemo(() => {
    return messages.slice(0, 6).map((m, i) => {
      const isInbound = m.direction === 'inbound';
      const missed = i === 2;
      return {
        id: m.id,
        title: isInbound ? m.from || m.conversationId : m.to || m.conversationId,
        description: missed ? 'Missed call' : isInbound ? 'Incoming message' : 'Outgoing call',
        time: formatTime(m.createdAt),
        type: missed ? 'missed' : isInbound ? 'call' : 'message',
      };
    });
  }, [messages]);

  return (
    <div className="space-y-2.5 p-2.5 md:space-y-6 md:p-4 lg:space-y-8 lg:p-6">
      <section>
        <h2 className="text-xl font-bold text-foreground md:text-3xl">Account Overview</h2>
        <p className="text-sm text-muted-foreground md:text-lg">
          Welcome back, {user.name}. Your enterprise communications are performing optimally.
        </p>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 md:gap-4 lg:gap-6 items-start">
        {/* Balance */}
        <div className="glass-card rounded-lg p-2.5 flex flex-col gap-2 hover:-translate-y-1 md:rounded-xl md:p-3">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary md:p-2 md:rounded-lg">
              <Wallet className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-[10px] font-bold text-primary md:text-xs">+2.4% vs last mo</span>
          </div>
          <div>
            <p className="text-primary/80 text-xs font-medium md:text-sm">Current Balance</p>
            <p className="text-lg font-bold text-primary md:text-2xl">$240.50</p>
          </div>
        </div>

        {/* Tokens */}
        <div className="glass-card rounded-lg p-2.5 flex flex-col gap-2 hover:-translate-y-1 md:rounded-xl md:p-3">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary md:p-2 md:rounded-lg">
              <Coins className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-[10px] font-bold text-primary md:text-xs">1,200 used today</span>
          </div>
          <div>
            <p className="text-primary/80 text-xs font-medium md:text-sm">Token Balance</p>
            <p className="text-lg font-bold text-primary md:text-2xl">12,000</p>
          </div>
        </div>

        {/* Active Numbers */}
        <div className="glass-card rounded-lg p-2.5 flex flex-col gap-2 hover:-translate-y-1 md:rounded-xl md:p-3">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary md:p-2 md:rounded-lg">
              <Phone className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
          <div>
            <p className="text-primary/80 text-xs font-medium md:text-sm">Active Numbers</p>
            <p className="text-lg font-bold text-primary md:text-2xl">{Math.max(1, conversations.length)}</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5 md:text-xs md:mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="glass-card rounded-lg p-2.5 flex flex-col items-center justify-center gap-2 text-center hover:-translate-y-1 transition-all md:rounded-xl md:p-5 md:gap-3"
          >
            <div className="p-2 bg-primary/10 rounded-lg text-primary md:p-3 md:rounded-xl">
              <PlusCircle className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <span className="font-semibold text-xs text-foreground md:text-sm">Buy Number</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="glass-card rounded-lg p-2.5 flex flex-col items-center justify-center gap-2 text-center hover:-translate-y-1 transition-all md:rounded-xl md:p-5 md:gap-3"
          >
            <div className="p-2 bg-primary/10 rounded-lg text-primary md:p-3 md:rounded-xl">
              <Zap className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <span className="font-semibold text-xs text-foreground md:text-sm">Recharge Tokens</span>
          </button>
          <button
            onClick={() => navigate('/calls')}
            className="glass-card rounded-lg p-2.5 flex flex-col items-center justify-center gap-2 text-center hover:-translate-y-1 transition-all md:rounded-xl md:p-5 md:gap-3"
          >
            <div className="p-2 bg-primary/10 rounded-lg text-primary md:p-3 md:rounded-xl">
              <Grid3X3 className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <span className="font-semibold text-xs text-foreground md:text-sm">Open Dialer</span>
          </button>
        </div>
      </section>

      {/* Main Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 md:gap-4 lg:gap-6 items-start">
        {/* Usage Chart */}
        <section className="lg:col-span-8 glass-card rounded-xl p-2.5 md:rounded-2xl md:p-4 lg:p-6">
          <div className="flex flex-col gap-2.5 mb-2.5 md:flex-row md:justify-between md:items-center md:mb-4 lg:mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground md:text-xl">Consumption Analytics</h3>
              <p className="text-xs text-muted-foreground md:text-sm">Call minutes and SMS over last 30 days</p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="rounded-full text-[10px] md:text-xs">
                30 Days
              </Button>
              <Button variant="outline" size="sm" className="rounded-full text-[10px] md:text-xs">
                90 Days
              </Button>
            </div>
          </div>

          <div className="w-full h-40 relative flex items-end justify-between px-1 pt-6 md:h-56 lg:h-72 md:px-2 md:pt-10">
            <div className="absolute inset-x-0 top-6 md:top-10 bottom-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-border" />
              <div className="border-t border-border" />
              <div className="border-t border-border" />
              <div className="border-t border-border" />
            </div>
            <div className="flex-1 flex items-end justify-around gap-1 md:gap-2 h-full z-10">
              {trend.counts.map((count, i) => {
                const height = trend.max ? `${(count / trend.max) * 100}%` : '5%';
                return (
                  <div
                    key={i}
                    className="w-3 md:w-4 lg:w-6 bg-primary/40 rounded-t-sm hover:bg-primary/70 transition-all"
                    style={{ height }}
                    title={`Week ${i + 1}: ${count}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-2.5 flex justify-around text-[10px] text-muted-foreground font-medium md:mt-4 lg:mt-6 md:text-xs">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-4 glass-card rounded-xl p-2.5 flex flex-col h-full md:rounded-2xl md:p-4 lg:p-6">
          <div className="flex justify-between items-center mb-2.5 md:mb-4 lg:mb-6">
            <h3 className="text-base font-bold text-foreground md:text-xl">Recent Activity</h3>
            <Button variant="link" className="h-auto p-0 text-[10px] text-primary font-bold md:text-xs" onClick={() => navigate('/messages')}>
              View All
            </Button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px] md:max-h-[220px] pr-1 md:gap-3 md:pr-2">
            {activity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 md:text-sm md:py-8">No recent activity</p>
            ) : (
              activity.map((item) => {
                const iconMap = {
                  call: { icon: PhoneIncoming, color: 'text-primary bg-primary/10' },
                  message: { icon: MessageCircle, color: 'text-secondary bg-secondary/10' },
                  missed: { icon: PhoneMissed, color: 'text-destructive bg-destructive/10' },
                };
                const meta = iconMap[item.type as keyof typeof iconMap] || iconMap.call;
                const Icon = meta.icon;
                const unread = item.type === 'message';
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group md:gap-4 md:p-3 md:rounded-xl',
                      unread && 'border-l-4 border-secondary bg-secondary/5'
                    )}
                    onClick={() => navigate('/messages')}
                  >
                    <div className={cn('w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all', meta.color)}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate md:text-sm">{item.title}</p>
                      <p className={cn('text-[10px] md:text-xs', item.type === 'missed' ? 'text-destructive' : 'text-muted-foreground')}>
                        {item.description}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap md:text-xs">{item.time}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-auto pt-2.5 md:pt-4 lg:pt-6">
            <div className="p-2.5 rounded-lg bg-muted border border-dashed border-border flex items-center gap-2 md:p-4 md:rounded-xl md:gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 md:h-5 md:w-5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed md:text-xs">
                You have <span className="font-bold text-foreground">{messages.length} messages</span> and{' '}
                <span className="font-bold text-foreground">{conversations.length} conversations</span> on your account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(Dashboard);
