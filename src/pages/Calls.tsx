import { useEffect, useRef, useState, useMemo, memo } from 'react';
import {
  Phone,
  Loader2,
  Settings,
  History,
  Timer,
  Disc,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Info,
  Delete,
  Video,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useSipContext } from '../context/SipContext';
import { saveSipCredentials } from '../lib/sipCredentials';
import { lookupUserByPhone, type DirectoryUser } from '../lib/directory';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

const keypad = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'abc' },
  { digit: '3', sub: 'def' },
  { digit: '4', sub: 'ghi' },
  { digit: '5', sub: 'jkl' },
  { digit: '6', sub: 'mno' },
  { digit: '7', sub: 'pqrs' },
  { digit: '8', sub: 'tuv' },
  { digit: '9', sub: 'wxyz' },
  { digit: '+', sub: '' },
  { digit: '0', sub: '' },
  { digit: '#', sub: '' },
];

type CallType = 'incoming' | 'outgoing' | 'missed';
type RecentFilter = 'all' | 'missed' | 'recorded';

interface CallRecord {
  id: string;
  name: string;
  phone: string;
  time: string;
  duration: string;
  type: CallType;
  recorded: boolean;
  date: Date;
}

function formatCallTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)m\s+(\d+)s/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export function Calls() {
  const isDesktop = useIsDesktop();
  const { status, error, activeCall, register, call } = useSipContext();
  const telnyxNumber = useAppStore((s) => s.telnyxNumber);

  const sipSettings = useAppStore((s) => s.sipSettings);
  const setSipSettings = useAppStore((s) => s.setSipSettings);
  const [settings, setSettings] = useState({
    username: sipSettings?.username || '',
    password: sipSettings?.password || '',
    phoneNumber: sipSettings?.phoneNumber || telnyxNumber || '',
  });
  const [number, setNumber] = useState('');
  const [directoryUser, setDirectoryUser] = useState<DirectoryUser | null>(null);
  const [recentFilter, setRecentFilter] = useState<RecentFilter>('all');
  const [recentPage, setRecentPage] = useState(1);
  const [recentLoading, setRecentLoading] = useState(true);
  const recentPageSize = 5;

  useEffect(() => {
    setRecentPage(1);
  }, [recentFilter]);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileTab, setMobileTab] = useState<'recents' | 'keypad'>('recents');
  const [callHistory, setCallHistory] = useState<CallRecord[]>([
    { id: '1', name: 'Sarah Jenkins', phone: '+1 (555) 098-7654', time: '10:24 AM', duration: '12m 45s', type: 'incoming', recorded: true, date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '2', name: 'Support Ticket #882', phone: '+1 (800) 912-0033', time: '09:15 AM', duration: '03m 12s', type: 'outgoing', recorded: false, date: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    { id: '3', name: 'Michael Chen', phone: '+1 (555) 234-5678', time: 'Yesterday', duration: '25m 10s', type: 'incoming', recorded: true, date: new Date(Date.now() - 1000 * 60 * 60 * 28) },
    { id: '4', name: 'Unknown Number', phone: '+1 (415) 555-1212', time: 'Yesterday', duration: '00m 00s', type: 'missed', recorded: false, date: new Date(Date.now() - 1000 * 60 * 60 * 30) },
    { id: '5', name: 'Marketing Sync', phone: '+1 (555) 111-2233', time: 'Oct 12', duration: '45m 00s', type: 'outgoing', recorded: true, date: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    { id: '6', name: 'Emma Wilson', phone: '+1 (555) 444-5566', time: 'Oct 12', duration: '08m 15s', type: 'incoming', recorded: false, date: new Date(Date.now() - 1000 * 60 * 60 * 50) },
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => setRecentLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!number.trim()) {
      setDirectoryUser(null);
      return;
    }
    lookupUserByPhone(number.trim()).then((user) => {
      if (!cancelled) setDirectoryUser(user);
    });
    return () => {
      cancelled = true;
    };
  }, [number]);

  const prevActiveCallRef = useRef(activeCall);
  useEffect(() => {
    if (prevActiveCallRef.current && !activeCall) {
      const ended = prevActiveCallRef.current;
      const durationSeconds = ended.durationSeconds || 0;
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const durationStr = `${mins}m ${secs.toString().padStart(2, '0')}s`;
      setCallHistory((prev) => [
        {
          id: crypto.randomUUID(),
          name: ended.remoteIdentity,
          phone: ended.remoteIdentity,
          time: formatCallTime(new Date()),
          duration: durationStr,
          type: ended.direction === 'incoming' && durationSeconds === 0 ? 'missed' : ended.direction,
          recorded: false,
          date: new Date(),
        },
        ...prev,
      ]);
    }
    prevActiveCallRef.current = activeCall;
  }, [activeCall]);

  const filteredCalls = useMemo(() => {
    let filtered = callHistory;
    if (recentFilter === 'missed') filtered = callHistory.filter((c) => c.type === 'missed');
    if (recentFilter === 'recorded') filtered = callHistory.filter((c) => c.recorded);
    const totalPages = Math.ceil(filtered.length / recentPageSize) || 1;
    const page = Math.min(recentPage, totalPages);
    return filtered.slice((page - 1) * recentPageSize, page * recentPageSize);
  }, [callHistory, recentFilter, recentPage]);

  const recentTotalPages = useMemo(() => {
    let filtered = callHistory;
    if (recentFilter === 'missed') filtered = callHistory.filter((c) => c.type === 'missed');
    if (recentFilter === 'recorded') filtered = callHistory.filter((c) => c.recorded);
    return Math.ceil(filtered.length / recentPageSize) || 1;
  }, [callHistory, recentFilter]);

  const stats = useMemo(() => {
    const completed = callHistory.filter((c) => c.type !== 'missed');
    const totalSeconds = completed.reduce((sum, c) => sum + parseDuration(c.duration), 0);
    const avg = completed.length ? Math.round(totalSeconds / completed.length) : 0;
    const mins = Math.floor(avg / 60);
    const secs = avg % 60;
    return {
      avgDuration: `${mins}m ${secs.toString().padStart(2, '0')}s`,
      recordings: callHistory.filter((c) => c.recorded).length,
    };
  }, [callHistory]);

  const handleDial = (digit: string) => {
    if (number.length < 16) setNumber((n) => n + digit);
  };
  const handleBackspace = () => setNumber((n) => n.slice(0, -1));
  const handleClear = () => setNumber('');
  const handleCall = async () => {
    if (!number.trim()) return;
    const target = directoryUser
      ? `sip:${directoryUser.sipUsername}@sip.telnyx.com`
      : number.trim();
    call(target);
  };

  const activeLine = telnyxNumber || settings.phoneNumber || '+1 (555) 012-3456';

  const tabs: { id: RecentFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'missed', label: 'Missed' },
    { id: 'recorded', label: 'Recorded' },
  ];

  function MobileCalls() {
    const formattedDial = useMemo(() => {
      const hasPlus = number.startsWith('+');
      const digits = number.replace(/\D/g, '');
      if (hasPlus) {
        return '+' + digits;
      }
      if (digits.length > 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
      if (digits.length > 3) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}`;
      }
      return digits;
    }, [number]);

    return (
      <div className="flex h-full flex-col gap-0 bg-background" style={{ isolation: 'isolate' }}>
        {/* Recents / Keypad View Toggle */}
        <div className="px-4 py-2 shrink-0 bg-background border-b border-border/10">
          <div className="flex bg-muted rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setMobileTab('recents')}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                mobileTab === 'recents' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
              )}
            >
              Recents
            </button>
            <button
              onClick={() => setMobileTab('keypad')}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                mobileTab === 'keypad' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
              )}
            >
              Keypad
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col w-full pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* View 1: Recents & Logs */}
          {mobileTab === 'recents' && (
            <div className="flex flex-col gap-4 -mx-4 px-4 pt-3 lg:mx-0 lg:px-4">
              {/* Active line & filter */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Active Line</p>
                  <p className="truncate text-sm font-semibold text-foreground">{activeLine}</p>
                </div>
                <div className="flex shrink-0 gap-1 rounded-lg bg-muted p-1">
                  <button
                    onClick={() => setRecentFilter('all')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[10px] font-bold transition-all',
                      recentFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRecentFilter('missed')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[10px] font-bold transition-all',
                      recentFilter === 'missed' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
                    )}
                  >
                    Missed
                  </button>
                </div>
              </div>

              {/* Call list */}
              <div className="flex flex-col gap-2">
                {recentLoading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-muted p-3">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-24 rounded" />
                          <Skeleton className="h-2 w-16 rounded" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : filteredCalls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <Phone className="mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm font-medium">No calls found</p>
                  </div>
                ) : (
                  filteredCalls.map((callItem) => {
                    const Icon = callItem.type === 'missed' ? PhoneMissed : callItem.type === 'incoming' ? PhoneIncoming : PhoneOutgoing;
                    const iconBg = callItem.type === 'missed' ? 'bg-destructive/10' : callItem.type === 'incoming' ? 'bg-green-100' : 'bg-primary/10';
                    const iconColor = callItem.type === 'missed' ? 'text-destructive' : callItem.type === 'incoming' ? 'text-green-600' : 'text-primary';
                    return (
                      <button
                        key={callItem.id}
                        className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left"
                        onClick={() => {
                          setNumber(callItem.phone);
                          setMobileTab('keypad');
                        }}
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconBg)}>
                          <Icon className={cn('h-5 w-5', iconColor)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{callItem.name}</p>
                          <p className="text-xs text-muted-foreground">{callItem.phone}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-xs text-muted-foreground">{callItem.time}</span>
                          <span className="text-xs font-medium text-foreground">{callItem.duration}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {recentTotalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                    disabled={recentPage === 1}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-foreground shadow-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {recentPage} / {recentTotalPages}
                  </span>
                  <button
                    onClick={() => setRecentPage((p) => Math.min(recentTotalPages, p + 1))}
                    disabled={recentPage === recentTotalPages}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-foreground shadow-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* View 2: Dialer Keypad */}
          {mobileTab === 'keypad' && (
            <div className="flex flex-col items-center w-full px-4 h-full justify-start gap-2.5 pb-3 pt-2">
              {/* Screen Display */}
              <div className="w-full text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Manual Entry</p>
                <div className="w-full h-14 bg-white rounded-2xl flex items-center justify-center px-4 overflow-hidden border border-border/20 shadow-inner">
                  <span className="text-3xl font-bold text-foreground tracking-wider truncate">{formattedDial}</span>
                  <span className={cn('ml-1 h-8 w-0.5 bg-primary/30', number.length < 15 && 'animate-pulse')} />
                </div>
                {directoryUser ? (
                  <p className="mt-1 text-xs font-medium text-primary">{directoryUser.name} is an app user — will ring in their browser</p>
                ) : number.trim().length >= 7 ? (
                  <p className="mt-1 text-xs text-muted-foreground">External number</p>
                ) : null}
              </div>

              {/* Numpad Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[260px] w-full mx-auto">
                {keypad.map((item) => (
                  <button
                    key={item.digit}
                    onClick={() => handleDial(item.digit)}
                    disabled={!!activeCall}
                    className={cn(
                      'dial-pad-btn aspect-square w-full rounded-full bg-white flex flex-col items-center justify-center border border-border/20 shadow-sm transition-all active:scale-95 active:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    <span className="text-[26px] font-medium text-foreground leading-none">{item.digit}</span>
                    {item.sub && <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{item.sub}</span>}
                  </button>
                ))}
              </div>

              {/* Call Actions */}
              <div className="flex items-center justify-center gap-6 w-full max-w-[260px] mx-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-2xl bg-white text-muted-foreground border-border/20 shadow-sm hover:bg-muted active:scale-95"
                  onClick={number ? handleBackspace : handleClear}
                  disabled={!number}
                >
                  <Delete className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(91,91,214,0.35)] active:scale-90 transition-transform hover:scale-105"
                  onClick={handleCall}
                  disabled={!!activeCall || !number.trim()}
                >
                  <Phone className="h-8 w-8" fill="currentColor" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-2xl bg-white text-muted-foreground border-border/20 shadow-sm hover:bg-muted active:scale-95"
                  disabled
                >
                  <Video className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {!isDesktop && <MobileCalls />}
      {isDesktop && (
        <div className="space-y-6">
      {/* Active Line & Settings */}
      <Card className="glass-card">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div className="flex-1">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Active Line</span>
            <div className="flex cursor-pointer items-center gap-2 group">
              <h2 className="text-2xl font-bold tracking-tight">{activeLine}</h2>
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">SIP Line • Outbound &amp; Inbound Enabled</p>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setShowSettings((s) => !s)}
            >
              <Settings className="mr-2 h-4 w-4" />
              SIP Settings
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl">
              <History className="mr-2 h-4 w-4" />
              Global History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SIP Settings Panel */}
      {showSettings && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="SIP Username"
                value={settings.username}
                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              />
              <Input
                type="password"
                placeholder="SIP Password"
                value={settings.password}
                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              />
              <Input
                placeholder="Phone Number (e.g. +12125551234)"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  setSipSettings(settings);
                  await saveSipCredentials(settings);
                  register(settings);
                }}
                disabled={status === 'connecting' || status === 'registered'}
              >
                {status === 'connecting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {status === 'registered' ? 'Registered' : status === 'connecting' ? 'Connecting...' : 'Register'}
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    status === 'registered' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  )}
                />
                <span className="font-medium">Status: {status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Recent Calls */}
        <div className="lg:col-span-7">
          <Card className="glass-card flex h-full min-h-[600px] flex-col overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/20 bg-white/40 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <History className="h-5 w-5 text-primary" />
                Recent Calls
              </h3>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRecentFilter(t.id)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-bold transition-all',
                      recentFilter === t.id ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {recentLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl border p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredCalls.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <Phone className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm font-medium">No calls found</p>
                </div>
              ) : (
                filteredCalls.map((callItem, index) => {
                  const Icon = callItem.type === 'missed' ? PhoneMissed : callItem.type === 'incoming' ? PhoneIncoming : PhoneOutgoing;
                  const iconColor = callItem.type === 'missed' ? 'text-destructive' : callItem.type === 'incoming' ? 'text-green-500' : 'text-primary';
                  const bgColor = callItem.type === 'missed' ? 'bg-destructive/10' : callItem.type === 'incoming' ? 'bg-green-500/10' : 'bg-primary/10';
                  return (
                    <div
                      key={callItem.id}
                      className="group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all hover:bg-white/60 hover:shadow-sm"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', bgColor)}>
                        <Icon className={cn('h-5 w-5', iconColor)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-bold">{callItem.name}</h4>
                        <p className="text-xs font-medium text-muted-foreground">{callItem.phone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">{callItem.time}</span>
                        <span className="text-xs font-bold text-muted-foreground">{callItem.duration}</span>
                      </div>
                      <div className="flex gap-2">
                        {callItem.recorded && (
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                            title="Playback"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted">
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-white/20 p-4">
              {recentTotalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                    disabled={recentPage === 1}
                    className="rounded-md bg-white/60 px-3 py-1.5 text-xs font-bold text-foreground shadow-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {recentPage} / {recentTotalPages}
                  </span>
                  <button
                    onClick={() => setRecentPage((p) => Math.min(recentTotalPages, p + 1))}
                    disabled={recentPage === recentTotalPages}
                    className="rounded-md bg-white/60 px-3 py-1.5 text-xs font-bold text-foreground shadow-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button className="text-sm font-semibold text-primary hover:underline">View All Activities</button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card flex flex-col gap-1 rounded-2xl p-4">
              <Timer className="h-5 w-5 text-amber-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Duration</p>
              <p className="text-xl font-bold">{stats.avgDuration}</p>
            </Card>
            <Card className="glass-card flex flex-col gap-1 rounded-2xl p-4">
              <Disc className="h-5 w-5 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recordings</p>
              <p className="text-xl font-bold">{stats.recordings}</p>
            </Card>
          </div>

          {/* Dial Pad */}
          <Card className="glass-card flex flex-col items-center rounded-2xl p-4 md:p-5">
            <div className="mb-4 w-full text-center">
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Manual Entry</h3>
              <div className="flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-white/40 px-4">
                <span className="truncate text-xl font-semibold tracking-widest text-primary">{number}</span>
                <span className={cn('ml-1 h-6 w-0.5 bg-primary/30', number.length < 15 && 'animate-pulse')} />
              </div>
              {directoryUser ? (
                <p className="mt-1 text-xs font-medium text-primary">
                  {directoryUser.name} is an app user — will ring in their browser
                </p>
              ) : number.trim().length >= 7 ? (
                <p className="mt-1 text-xs text-muted-foreground">External number</p>
              ) : null}
            </div>
            <div className="grid w-full max-w-[280px] grid-cols-3 gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
              {keypad.map((item) => (
                <button
                  key={item.digit}
                  onClick={() => handleDial(item.digit)}
                  disabled={!!activeCall}
                  className={cn(
                    'flex h-12 w-12 flex-col items-center justify-center rounded-full border border-primary/10 shadow-sm transition-all hover:border-primary/40 active:scale-95 active:bg-primary/10 sm:h-14 sm:w-14',
                    activeCall ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary/5'
                  )}
                >
                  <span className="text-lg font-bold sm:text-xl">{item.digit}</span>
                  {item.sub && <span className="text-[9px] font-medium uppercase text-muted-foreground">{item.sub}</span>}
                </button>
              ))}
            </div>
            <div className="mt-5 flex w-full items-center justify-center gap-3 sm:mt-6 sm:gap-5">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl sm:h-12 sm:w-12"
                onClick={number ? handleBackspace : handleClear}
                disabled={!number}
              >
                <Delete className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
                onClick={handleCall}
                disabled={!!activeCall || !number.trim()}
              >
                <Phone className="h-6 w-6 sm:h-7 sm:w-7" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl sm:h-12 sm:w-12"
                disabled
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    )}
    </>
  );
}

export default memo(Calls);
