import { useState, useMemo, memo } from 'react';
import {
  Phone,
  MessageSquare,
  Clock,
  Coins,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ChevronDown,
  Download,
  Globe,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  progress: number;
  progressColor: string;
}

const kpiData: KpiCard[] = [
  {
    label: 'Total Call Minutes',
    value: '14,282',
    change: '+12%',
    trend: 'up',
    icon: Phone,
    iconColor: 'text-primary bg-primary/10',
    progress: 75,
    progressColor: 'bg-primary',
  },
  {
    label: 'SMS Sent/Received',
    value: '8,419',
    change: '+4.5%',
    trend: 'up',
    icon: MessageSquare,
    iconColor: 'text-secondary bg-secondary/10',
    progress: 50,
    progressColor: 'bg-secondary',
  },
  {
    label: 'Avg. Call Duration',
    value: '4m 12s',
    change: '-2.1%',
    trend: 'down',
    icon: Clock,
    iconColor: 'text-amber-600 bg-amber-500/10',
    progress: 40,
    progressColor: 'bg-amber-500',
  },
  {
    label: 'Token Consumption',
    value: '38,102',
    change: 'Target: 50k',
    trend: 'neutral',
    icon: Coins,
    iconColor: 'text-primary bg-primary/10',
    progress: 76,
    progressColor: 'bg-primary',
  },
];

const topContacts = [
  {
    id: '1',
    initials: 'JD',
    color: 'bg-primary/10 text-primary',
    name: 'Jordan Davids',
    number: '+1 (555) 012-3456',
    region: 'North America',
    volume: '1,242 Calls',
    duration: '42h 15m',
    trend: '+18%',
    trendUp: true,
  },
  {
    id: '2',
    initials: 'AM',
    color: 'bg-secondary/10 text-secondary',
    name: 'Aria Martinez',
    number: '+44 20 7946 0958',
    region: 'Europe',
    volume: '892 Calls',
    duration: '28h 05m',
    trend: '+12%',
    trendUp: true,
  },
  {
    id: '3',
    initials: 'LK',
    color: 'bg-amber-500/10 text-amber-600',
    name: 'Lian Kim',
    number: '+61 2 9876 5432',
    region: 'Asia-Pacific',
    volume: '754 Calls',
    duration: '19h 42m',
    trend: '-4%',
    trendUp: false,
  },
];

const geographicData = [
  { region: 'United States', percent: 42 },
  { region: 'United Kingdom', percent: 28 },
  { region: 'Canada', percent: 15 },
  { region: 'Australia', percent: 10 },
];

const tokenBreakdown = [
  { label: 'Voice Calls', percent: 65, color: 'bg-primary' },
  { label: 'SMS volume', percent: 25, color: 'bg-secondary' },
  { label: 'Subscriptions', percent: 10, color: 'bg-muted' },
];

function getHeatmapClass(value: number) {
  if (value > 80) return 'bg-primary';
  if (value > 50) return 'bg-primary/60';
  if (value > 30) return 'bg-primary/30';
  return 'bg-primary/10';
}

export function Usage() {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const heatmapData = useMemo(() => {
    const rows = 7;
    const cols = 24;
    const data: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(Math.floor(Math.random() * 100));
      }
      data.push(row);
    }
    return data;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-sm text-muted-foreground">Monitor your global communication performance and token spend.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm transition-all hover:bg-muted">
            <CalendarDays className="h-4 w-4" />
            <span>Last 30 Days</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="flex overflow-hidden rounded-xl border border-primary/20 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-none border-r border-primary/20 px-4',
                exportFormat === 'csv' ? 'bg-primary/10 text-primary' : 'text-primary'
              )}
              onClick={() => setExportFormat('csv')}
            >
              <Download className="mr-1 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-none px-4',
                exportFormat === 'pdf' ? 'bg-primary/10 text-primary' : 'text-primary'
              )}
              onClick={() => setExportFormat('pdf')}
            >
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="glass-card">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className={cn('rounded-lg p-2', kpi.iconColor)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs font-semibold',
                      kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    )}
                  >
                    {kpi.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : kpi.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <h3 className="mt-1 text-2xl font-bold">{kpi.value}</h3>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full', kpi.progressColor)} style={{ width: `${kpi.progress}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Middle Section: Chart + Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold">Consumption Analytics</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-xs text-muted-foreground">SMS</span>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-border/30 bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
              <svg className="absolute bottom-0 left-0 h-full w-full p-4" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path
                  d="M0,80 Q10,75 20,85 T40,60 T60,70 T80,40 T100,50 L100,100 L0,100 Z"
                  fill="rgba(66, 65, 188, 0.1)"
                />
                <path
                  d="M0,80 Q10,75 20,85 T40,60 T60,70 T80,40 T100,50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="text-primary"
                />
                <path
                  d="M0,90 Q10,88 20,92 T40,85 T60,88 T80,82 T100,85"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  className="text-secondary"
                />
              </svg>
              <div className="absolute inset-x-4 bottom-2 flex justify-between text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="flex h-full flex-col p-5">
            <h4 className="mb-4 font-semibold">Token Usage Breakdown</h4>
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="16" className="text-muted" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeDasharray={`${65 * 2.51} ${100 * 2.51}`}
                    className="text-primary"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeDasharray={`${25 * 2.51} ${100 * 2.51}`}
                    strokeDashoffset={-65 * 2.51}
                    className="text-secondary"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold">38k</p>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                </div>
              </div>
              <div className="mt-4 w-full space-y-2">
                {tokenBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', item.color)} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section: Heatmap + Geography */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold">Activity Heatmap</h4>
              <span className="text-xs text-muted-foreground">Timezone: UTC -5</span>
            </div>
            <div className="space-y-4">
              <div
                className="grid h-32 gap-1"
                style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}
              >
                {heatmapData.flat().map((value, i) => (
                  <div
                    key={i}
                    title={`Hour ${i % 24}:00 - Volume ${value}`}
                    className={cn(
                      'rounded-sm transition-transform hover:z-10 hover:scale-110',
                      getHeatmapClass(value)
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between px-1 text-[10px] text-muted-foreground">
                <span>12 AM</span>
                <span>4 AM</span>
                <span>8 AM</span>
                <span>12 PM</span>
                <span>4 PM</span>
                <span>8 PM</span>
                <span>11 PM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Usage Intensity</span>
                <div className="flex gap-1">
                  <div className="h-4 w-4 rounded bg-primary/10" />
                  <div className="h-4 w-4 rounded bg-primary/30" />
                  <div className="h-4 w-4 rounded bg-primary/60" />
                  <div className="h-4 w-4 rounded bg-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <h4 className="mb-4 font-semibold">Geographic Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-40 overflow-hidden rounded-xl border border-border/30 bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-primary/40" />
                </div>
              </div>
              <div className="flex flex-col justify-center gap-3">
                {geographicData.map((item) => (
                  <div key={item.region} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.region}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contacts Table */}
      <Card className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/30 p-5">
          <h4 className="font-semibold">Top Contacts</h4>
          <button className="text-sm text-primary hover:underline">View All Contacts</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Region</th>
                <th className="px-5 py-4">Volume</th>
                <th className="px-5 py-4">Total Duration</th>
                <th className="px-5 py-4">Trend</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {topContacts.map((contact) => (
                <tr key={contact.id} className="group transition-colors hover:bg-primary/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-full font-bold', contact.color)}>
                        {contact.initials}
                      </div>
                      <div>
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{contact.region}</td>
                  <td className="px-5 py-4 text-sm">{contact.volume}</td>
                  <td className="px-5 py-4 text-sm">{contact.duration}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-[10px] font-bold',
                        contact.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}
                    >
                      {contact.trend}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-muted-foreground transition-colors group-hover:text-primary">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default memo(Usage);
