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
    <div className="space-y-8 pt-4">
      <section>
        <h2 className="text-3xl font-bold text-foreground">Account Overview</h2>
        <p className="text-lg text-muted-foreground">
          Welcome back, {user.name}. Your enterprise communications are performing optimally.
        </p>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-start">
        {/* Balance */}
        <div className="glass-card rounded-xl p-3 flex flex-col gap-2 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-primary">+2.4% vs last mo</span>
          </div>
          <div>
            <p className="text-primary/80 text-sm font-medium">Current Balance</p>
            <p className="text-2xl font-bold text-primary">$240.50</p>
          </div>
        </div>

        {/* Tokens */}
        <div className="glass-card rounded-xl p-3 flex flex-col gap-2 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Coins className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-primary">1,200 used today</span>
          </div>
          <div>
            <p className="text-primary/80 text-sm font-medium">Token Balance</p>
            <p className="text-2xl font-bold text-primary">12,000</p>
          </div>
        </div>

        {/* Active Numbers */}
        <div className="glass-card rounded-xl p-3 flex flex-col gap-2 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Phone className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-primary/80 text-sm font-medium">Active Numbers</p>
            <p className="text-2xl font-bold text-primary">{Math.max(1, conversations.length)}</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="glass-card rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 transition-all"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <PlusCircle className="h-7 w-7" />
            </div>
            <span className="font-semibold text-sm text-foreground">Buy Number</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="glass-card rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 transition-all"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Zap className="h-7 w-7" />
            </div>
            <span className="font-semibold text-sm text-foreground">Recharge Tokens</span>
          </button>
          <button
            onClick={() => navigate('/calls')}
            className="glass-card rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 transition-all"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Grid3X3 className="h-7 w-7" />
            </div>
            <span className="font-semibold text-sm text-foreground">Open Dialer</span>
          </button>
        </div>
      </section>

      {/* Main Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Usage Chart */}
        <section className="lg:col-span-8 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Consumption Analytics</h3>
              <p className="text-muted-foreground">Call minutes and SMS over last 30 days</p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="rounded-full">
                30 Days
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                90 Days
              </Button>
            </div>
          </div>

          <div className="w-full h-72 relative flex items-end justify-between px-2 pt-10">
            <div className="absolute inset-x-0 top-10 bottom-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-border" />
              <div className="border-t border-border" />
              <div className="border-t border-border" />
              <div className="border-t border-border" />
            </div>
            <div className="flex-1 flex items-end justify-around gap-2 h-full z-10">
              {trend.counts.map((count, i) => {
                const height = trend.max ? `${(count / trend.max) * 100}%` : '5%';
                return (
                  <div
                    key={i}
                    className="w-6 bg-primary/40 rounded-t-sm hover:bg-primary/70 transition-all"
                    style={{ height }}
                    title={`Week ${i + 1}: ${count}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-6 flex justify-around text-xs text-muted-foreground font-medium">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
            <Button variant="link" className="h-auto p-0 text-primary font-bold" onClick={() => navigate('/messages')}>
              View All
            </Button>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] pr-2">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
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
                      'flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group',
                      unread && 'border-l-4 border-secondary bg-secondary/5'
                    )}
                    onClick={() => navigate('/messages')}
                  >
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-all', meta.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className={cn('text-xs', item.type === 'missed' ? 'text-destructive' : 'text-muted-foreground')}>
                        {item.description}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-auto pt-6">
            <div className="p-4 rounded-xl bg-muted border border-dashed border-border flex items-center gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
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
