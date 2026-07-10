import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Activity,
  Phone,
  MessageSquare,
  Voicemail,
  Edit3,
  BarChart3,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

interface NumberCard {
  id: string;
  name: string;
  number: string;
  country: string;
  status: 'online' | 'reserved';
  features: {
    calls: boolean;
    sms: boolean;
    voicemail: boolean;
  };
}

const initialNumbers: NumberCard[] = [
  {
    id: '1',
    name: 'Sales Desk',
    number: '+1 (415) 555-0123',
    country: '🇺🇸',
    status: 'online',
    features: { calls: true, sms: true, voicemail: false },
  },
  {
    id: '2',
    name: 'Support Line',
    number: '+44 20 7946 0148',
    country: '🇬🇧',
    status: 'online',
    features: { calls: true, sms: false, voicemail: true },
  },
  {
    id: '3',
    name: 'Mkt Berlin',
    number: '+49 30 123456',
    country: '🇩🇪',
    status: 'reserved',
    features: { calls: false, sms: false, voicemail: false },
  },
  {
    id: '4',
    name: 'Dev Test',
    number: '+1 (647) 555-9012',
    country: '🇨🇦',
    status: 'online',
    features: { calls: false, sms: true, voicemail: false },
  },
];

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn('relative inline-flex cursor-pointer items-center', disabled && 'cursor-not-allowed opacity-50')}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={cn(
          'peer h-5 w-10 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
          disabled && 'bg-muted'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </div>
    </label>
  );
}

function NumberCardItem({ data }: { data: NumberCard }) {
  const [features, setFeatures] = useState(data.features);
  const isOnline = data.status === 'online';

  return (
    <div
      className={cn(
        'glass-card flex flex-col rounded-[2rem] p-5 transition-transform hover:-translate-y-1 hover:shadow-xl',
        !isOnline && 'opacity-80'
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl shadow-inner">
            {data.country}
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-tight">{data.name}</h3>
            <p className="text-sm text-muted-foreground">{data.number}</p>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold',
            isOnline
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-secondary/20 bg-secondary/10 text-secondary'
          )}
        >
          {isOnline && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />}
          {isOnline ? 'ONLINE' : 'RESERVED'}
        </div>
      </div>

      <div className={cn('my-3 space-y-2', !isOnline && 'grayscale-[0.5]')}>
        <div className="flex items-center justify-between rounded-xl bg-white/40 p-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Calls</span>
          </div>
          <Toggle checked={features.calls} onChange={(v) => setFeatures((f) => ({ ...f, calls: v }))} disabled={!isOnline} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/40 p-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">SMS</span>
          </div>
          <Toggle checked={features.sms} onChange={(v) => setFeatures((f) => ({ ...f, sms: v }))} disabled={!isOnline} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/40 p-3">
          <div className="flex items-center gap-2">
            <Voicemail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Voicemail</span>
          </div>
          <Toggle
            checked={features.voicemail}
            onChange={(v) => setFeatures((f) => ({ ...f, voicemail: v }))}
            disabled={!isOnline}
          />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/20 pt-3">
        {!isOnline ? (
          <button className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
            <CheckCircle2 className="h-4 w-4" />
            Activate
          </button>
        ) : (
          <button className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
            <Edit3 className="h-4 w-4" />
            Rename
          </button>
        )}
        <button className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
          <BarChart3 className="h-4 w-4" />
          Usage
        </button>
        <button className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
          <RefreshCw className="h-4 w-4" />
          Renew
        </button>
        <button className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5">
          <Trash2 className="h-4 w-4" />
          Release
        </button>
      </div>
    </div>
  );
}

export function PhoneNumbers() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Page Title & Primary Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>Assets</span>
            <span>/</span>
            <span className="font-bold text-primary">Phone Numbers</span>
          </nav>
          <h2 className="text-3xl font-bold text-foreground">Manage Numbers</h2>
          <p className="text-muted-foreground">You have 12 active virtual lines across 4 regions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search number or nickname..." className="h-10 rounded-xl pl-9" />
          </div>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Filter className="h-4 w-4" />
            Country: All
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Activity className="h-4 w-4" />
            Status: Online
          </Button>
          <Button className="gap-2 rounded-xl md:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Numbers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialNumbers.map((n) => (
          <NumberCardItem key={n.id} data={n} />
        ))}

        {/* Add New Number Card */}
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">Add New Number</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Expand your reach with virtual numbers in 100+ countries.
          </p>
          <Button className="rounded-xl px-8 shadow-lg shadow-primary/20" onClick={() => navigate('/settings')}>
            Browse Numbers
          </Button>
        </div>
      </div>

      {/* Usage Insight Banner */}
      <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] glass-card p-6 md:flex-row">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl">
          <Lightbulb className="h-10 w-10" />
        </div>
        <div className="relative z-10 flex-1">
          <h4 className="mb-1 text-xl font-semibold">Optimization Tip</h4>
          <p className="text-muted-foreground">
            Your 'Sales Desk' number has reached 85% of its monthly token limit. Consider setting up an auto-recharge or
            upgrading your tier to prevent service interruption.
          </p>
        </div>
        <div className="relative z-10">
          <Button variant="outline" className="rounded-xl px-6 font-semibold">
            View Usage Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(PhoneNumbers);
