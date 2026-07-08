import { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

const statMeta = [
  { label: 'Total Calls', value: '24', change: '+12%', icon: Phone, trend: 'up' },
  { label: 'Messages', value: '142', change: '+8%', icon: MessageSquare, trend: 'up' },
  { label: 'Avg. Duration', value: '4m 12s', change: '-2%', icon: Clock, trend: 'down' },
  { label: 'Contacts', value: '38', change: '+4', icon: Users, trend: 'up' },
] as const;

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildTrend(messages: ReturnType<typeof useAppStore.getState>['messages']) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const counts = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return messages.filter((m) => {
      const t = new Date(m.createdAt);
      return t >= day && t < next;
    }).length;
  });
  const max = Math.max(1, ...counts);
  return { labels: days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' })), counts, max };
}

export function Dashboard() {
  const messages = useAppStore((s) => s.messages);
  const conversations = useAppStore((s) => s.conversations);
  const navigate = useNavigate();
  const loading = false;

  const stats = useMemo(() => {
    return statMeta.map((s) => ({
      ...s,
      value: s.label === 'Messages' ? String(messages.length) : s.label === 'Contacts' ? String(conversations.length) : s.value,
    }));
  }, [messages.length, conversations.length]);

  const trend = useMemo(() => buildTrend(messages), [messages]);
  const activity = useMemo(() => {
    return messages.slice(0, 8).map((m) => ({
      id: m.id,
      title: m.direction === 'inbound' ? `Message from ${m.from || m.conversationId}` : `Sent to ${m.to || m.conversationId}`,
      description: m.type === 'text' ? m.body : `Sent ${m.type}${m.mediaName ? `: ${m.mediaName}` : ''}`,
      time: formatTime(m.createdAt),
      type: m.direction === 'inbound' ? 'call' : 'message',
    }));
  }, [messages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your communications activity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/calls')}>New Call</Button>
          <Button onClick={() => navigate('/messages')}>New Message</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">{stat.label}</CardDescription>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={cn('flex items-center gap-1 text-xs', stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                    <TrendIcon className="h-3 w-3" />
                    {stat.change} from last week
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Messages Trend</CardTitle>
            <CardDescription>Daily message volume over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {trend.counts.every((c) => c === 0) ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No message data yet.
              </div>
            ) : (
              <div className="flex h-48 items-end gap-2">
                {trend.counts.map((count, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${(count / trend.max) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{trend.labels[i]}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/calls')}>
              <Phone className="mr-2 h-4 w-4 text-primary" />
              Start a call
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/messages')}>
              <MessageSquare className="mr-2 h-4 w-4 text-primary" />
              Send message
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/contacts')}>
              <Users className="mr-2 h-4 w-4 text-primary" />
              Add contact
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/messages')}>
              <Clock className="mr-2 h-4 w-4 text-primary" />
              View history
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent calls and messages across your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p className="font-medium">No recent activity</p>
              <p className="text-xs">Start a call or send a message to see activity here.</p>
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {item.type === 'call' ? <Phone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">{item.time}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(Dashboard);
