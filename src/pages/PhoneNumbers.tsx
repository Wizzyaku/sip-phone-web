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
        'glass-card flex flex-col rounded-2xl p-2.5 transition-transform hover:-translate-y-1 hover:shadow-xl md:rounded-[2rem] md:p-4 lg:p-5',
        !isOnline && 'opacity-80'
      )}
    >
      <div className="mb-2 flex items-start justify-between md:mb-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-lg shadow-inner md:h-12 md:w-12 md:rounded-2xl md:text-2xl">
            {data.country}
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight md:text-lg">{data.name}</h3>
            <p className="text-xs text-muted-foreground md:text-sm">{data.number}</p>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs',
            isOnline
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-secondary/20 bg-secondary/10 text-secondary'
          )}
        >
          {isOnline && <span className="h-1 w-1 animate-pulse rounded-full bg-primary md:h-1.5 md:w-1.5" />}
          {isOnline ? 'ONLINE' : 'RESERVED'}
        </div>
      </div>

      <div className={cn('my-2 space-y-1.5 md:my-3 md:space-y-2', !isOnline && 'grayscale-[0.5]')}>
        <div className="flex items-center justify-between rounded-lg bg-white/40 p-2 md:rounded-xl md:p-3">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Calls</span>
          </div>
          <Toggle checked={features.calls} onChange={(v) => setFeatures((f) => ({ ...f, calls: v }))} disabled={!isOnline} />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/40 p-2 md:rounded-xl md:p-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">SMS</span>
          </div>
          <Toggle checked={features.sms} onChange={(v) => setFeatures((f) => ({ ...f, sms: v }))} disabled={!isOnline} />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/40 p-2 md:rounded-xl md:p-3">
          <div className="flex items-center gap-2">
            <Voicemail className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Voicemail</span>
          </div>
          <Toggle
            checked={features.voicemail}
            onChange={(v) => setFeatures((f) => ({ ...f, voicemail: v }))}
            disabled={!isOnline}
          />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-1.5 border-t border-white/20 pt-2 md:gap-2 md:pt-3">
        {!isOnline ? (
          <button className="flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 md:rounded-lg md:py-2 md:text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Activate
          </button>
        ) : (
          <button className="flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 md:rounded-lg md:py-2 md:text-sm">
            <Edit3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Rename
          </button>
        )}
        <button className="flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 md:rounded-lg md:py-2 md:text-sm">
          <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Usage
        </button>
        <button className="flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 md:rounded-lg md:py-2 md:text-sm">
          <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Renew
        </button>
        <button className="flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5 md:rounded-lg md:py-2 md:text-sm">
          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Release
        </button>
      </div>
    </div>
  );
}

export function PhoneNumbers() {
  const navigate = useNavigate();

  return (
    <div className="space-y-2.5 p-2.5 md:space-y-6 md:p-4 lg:space-y-8 lg:p-6">
      {/* Page Title & Primary Actions */}
      <div className="flex flex-col justify-between gap-2.5 md:flex-row md:items-end md:gap-4">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
            <span>Assets</span>
            <span>/</span>
            <span className="font-bold text-primary">Phone Numbers</span>
          </nav>
          <h2 className="text-xl font-bold text-foreground md:text-3xl">Manage Numbers</h2>
          <p className="text-xs text-muted-foreground md:text-sm">You have 12 active virtual lines across 4 regions.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search number or nickname..." className="h-10 rounded-xl pl-9" />
          </div>
          <Button variant="outline" className="gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm">
            <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Country:</span> All
          </Button>
          <Button variant="outline" className="gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm">
            <Activity className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Status:</span> Online
          </Button>
          <Button className="gap-1.5 rounded-lg px-2.5 py-1.5 md:gap-2 md:rounded-xl md:px-4 md:py-2 md:hidden">
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
          <Button className="hidden gap-2 rounded-xl md:flex">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Numbers Grid */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-4 lg:gap-6 lg:grid-cols-3">
        {initialNumbers.map((n) => (
          <NumberCardItem key={n.id} data={n} />
        ))}

        {/* Add New Number Card */}
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-2.5 text-center transition-colors hover:border-primary/50 md:min-h-[350px] md:rounded-[2rem] md:p-6">
          <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 md:mb-4 md:h-16 md:w-16">
            <Plus className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <h3 className="mb-1 text-sm font-semibold md:text-lg">Add New Number</h3>
          <p className="mb-2.5 max-w-xs text-xs text-muted-foreground md:mb-6 md:text-sm">
            Expand your reach with virtual numbers in 100+ countries.
          </p>
          <Button className="rounded-lg px-4 py-1.5 text-xs shadow-lg shadow-primary/20 md:rounded-xl md:px-8 md:py-2 md:text-sm" onClick={() => navigate('/settings')}>
            Browse Numbers
          </Button>
        </div>
      </div>

      {/* Usage Insight Banner */}
      <div className="relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl glass-card p-2.5 md:flex-row md:gap-6 md:rounded-[2.5rem] md:p-6">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl md:h-24 md:w-24 md:rounded-3xl">
          <Lightbulb className="h-7 w-7 md:h-10 md:w-10" />
        </div>
        <div className="relative z-10 flex-1">
          <h4 className="mb-0.5 text-base font-semibold md:mb-1 md:text-xl">Optimization Tip</h4>
          <p className="text-xs text-muted-foreground md:text-base">
            Your 'Sales Desk' number has reached 85% of its monthly token limit. Consider setting up an auto-recharge or
            upgrading your tier to prevent service interruption.
          </p>
        </div>
        <div className="relative z-10">
          <Button variant="outline" className="rounded-lg px-3 py-1.5 text-xs font-semibold md:rounded-xl md:px-6 md:py-2 md:text-sm">
            View Usage Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(PhoneNumbers);
