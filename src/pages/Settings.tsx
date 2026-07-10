import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  Palette,
  Bell,
  Shield,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Pencil,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Laptop,
  Smartphone,
  RotateCcw,
  Check,
  Phone,
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
] as const;

const themes = [
  { id: 'light', label: 'Light Theme', icon: Sun },
  { id: 'dark', label: 'Dark Theme', icon: Moon },
  { id: 'system', label: 'System Theme', icon: Monitor },
] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const sessions = [
  { id: '1', device: 'MacBook Pro 16"', icon: Laptop, location: 'London, UK', ip: '192.168.1.45', current: true },
  { id: '2', device: 'iPhone 15 Pro', icon: Smartphone, location: 'Paris, FR', ip: '82.14.99.102', current: false },
];

export function Settings() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const notifications = useAppStore((s) => s.notifications);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const telnyxNumber = useAppStore((s) => s.telnyxNumber);
  const setTelnyxNumber = useAppStore((s) => s.setTelnyxNumber);

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'appearance' | 'notifications' | 'security'>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ name: user.name, email: user.email, bio: user.bio ?? '', avatar: user.avatar });
  const [numberDraft, setNumberDraft] = useState(telnyxNumber ?? '');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const accountNumber = '#PRO-8892-XKB-001';

  const handleSave = () => {
    setUser({ ...user, ...draft, avatar: getInitials(draft.name) });
    setSaved(true);
    setEditingProfile(false);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const API_URL = import.meta.env.VITE_API_URL ?? '/api';

  const handleVerifyNumber = async () => {
    const raw = numberDraft.trim();
    if (!raw) return;
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await axios.post(`${API_URL}/verify-number`, { phoneNumber: raw });
      if (res.data.valid) {
        setVerifyStatus({ type: 'success', message: `${res.data.phoneNumber} is verified and active.` });
      } else {
        setVerifyStatus({ type: 'error', message: 'Number could not be verified.' });
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'Verification failed';
      setVerifyStatus({ type: 'error', message });
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveNumber = () => {
    setTelnyxNumber(numberDraft.trim() || null);
    setVerifyStatus({ type: 'success', message: 'Sender number saved.' });
    window.setTimeout(() => setVerifyStatus(null), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your organization&apos;s configuration and personal preferences.</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-6 border-b border-border/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-2 pb-4 text-sm font-medium transition-all',
                  active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="glass-card md:col-span-2">
            <CardContent className="p-5">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Personal Details</h3>
                  <p className="text-sm text-muted-foreground">Update your name, bio and company role.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingProfile((v) => !v)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    {editingProfile ? (
                      <Input
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="rounded-xl"
                      />
                    ) : (
                      <div className="rounded-xl border bg-muted p-3 text-sm">{user.name}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    {editingProfile ? (
                      <Input
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        className="rounded-xl"
                      />
                    ) : (
                      <div className="rounded-xl border bg-muted p-3 text-sm">{user.email}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Number</label>
                  <div className="flex items-center justify-between rounded-xl border bg-muted p-3">
                    <span className="font-mono text-sm font-bold text-primary">{accountNumber}</span>
                    <button onClick={handleCopyAccount} className="text-muted-foreground hover:text-primary">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Bio</label>
                  {editingProfile ? (
                    <Input
                      value={draft.bio}
                      onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                      placeholder="Tell us about your role"
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="rounded-xl border bg-muted p-3 text-sm italic text-muted-foreground">
                      {user.bio || 'Senior Account Executive managing enterprise communications.'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center p-5 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-semibold text-primary">Active</h4>
                <p className="mb-4 text-xs text-muted-foreground">Two-Factor Authentication is currently securing your account.</p>
                <Button variant="outline" className="w-full">Configure 2FA</Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5">
                <h4 className="mb-4 text-sm font-semibold">Appearance</h4>
                <div className="space-y-2">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const active = theme === t.id;
                    return (
                      <label
                        key={t.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all',
                          active ? 'border-primary bg-primary/5' : 'border-border bg-muted hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{t.label}</span>
                        </div>
                        <input
                          type="radio"
                          name="theme"
                          checked={active}
                          onChange={() => setTheme(t.id as typeof theme)}
                          className="h-4 w-4 text-primary focus:ring-primary/20"
                        />
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Telnyx Sender Number</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Verify and set the phone number used to send SMS from the web.</p>
            <div className="flex items-center gap-2">
              <Input
                type="tel"
                value={numberDraft}
                onChange={(e) => setNumberDraft(e.target.value)}
                placeholder="+14237303370"
                className="flex-1"
              />
              <Button onClick={handleVerifyNumber} disabled={verifying || !numberDraft.trim()}>
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
            {verifyStatus && (
              <div
                className={cn(
                  'mt-3 flex items-center gap-2 text-sm',
                  verifyStatus.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {verifyStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {verifyStatus.message}
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={handleSaveNumber} disabled={!numberDraft.trim()}>
                Save Number
              </Button>
              {telnyxNumber && (
                <span className="text-sm text-muted-foreground">
                  Current: <span className="font-medium text-foreground">{telnyxNumber}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card className="glass-card">
          <CardContent className="p-5">
            <h3 className="mb-4 text-lg font-semibold">Appearance</h3>
            <p className="mb-4 text-sm text-muted-foreground">Choose how the dashboard looks.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as typeof theme)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                      active ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="glass-card">
          <CardContent className="p-5">
            <h3 className="mb-1 text-lg font-semibold">Notifications</h3>
            <p className="mb-4 text-sm text-muted-foreground">Manage notification history.</p>
            <p className="text-sm text-muted-foreground">
              You have {notifications.length} stored notification{notifications.length === 1 ? '' : 's'}.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearNotifications}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/30 p-5">
            <h3 className="text-lg font-semibold">Security &amp; Access</h3>
            <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Real-time monitoring
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Device</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">IP Address</th>
                  <th className="px-5 py-4">Last Activity</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {sessions.map((session) => {
                  const Icon = session.icon;
                  return (
                    <tr key={session.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', session.current ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="text-sm font-medium">{session.device}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm">{session.location}</td>
                      <td className="px-5 py-4 font-mono text-sm">{session.ip}</td>
                      <td className="px-5 py-4">
                        {session.current ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                            <span className="h-2 w-2 rounded-full bg-amber-600" />
                            Current Session
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">2 hours ago</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button className="text-sm font-medium text-destructive hover:underline">Revoke</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/30 p-5">
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </Card>
      )}

      {/* Action Bar */}
      {activeTab === 'profile' && (
        <div className="flex items-center justify-end gap-3 rounded-xl bg-muted p-4">
          <Button variant="ghost" onClick={() => { setEditingProfile(false); setDraft({ ...draft, name: user.name, email: user.email, bio: user.bio ?? '' }); }}>
            Discard Changes
          </Button>
          <Button onClick={handleSave} disabled={saved}>
            {saved && <Check className="mr-2 h-4 w-4" />}
            {saved ? 'Saved' : 'Save Settings'}
          </Button>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-20 right-10 z-50 flex items-center gap-3 rounded-xl bg-foreground p-4 text-background shadow-2xl md:bottom-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Settings Saved</p>
            <p className="text-xs opacity-80">Your profile changes have been synchronized.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Settings);
