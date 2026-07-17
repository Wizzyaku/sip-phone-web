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
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Mail,
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { saveProfile } from '../lib/profile';

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

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resetStep, setResetStep] = useState<'form' | 'code-sent' | 'success'>('form');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [codeResendTimer, setCodeResendTimer] = useState(0);

  const accountNumber = '#PRO-8892-XKB-001';

  const handleSave = async () => {
    const updatedUser = { ...user, ...draft, avatar: getInitials(draft.name) };
    setUser(updatedUser);
    await saveProfile(updatedUser, telnyxNumber);
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

  const handleSaveNumber = async () => {
    const number = numberDraft.trim() || null;
    setTelnyxNumber(number);
    await saveProfile(user, number);
    setVerifyStatus({ type: 'success', message: 'Sender number saved.' });
    window.setTimeout(() => setVerifyStatus(null), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSendResetCode = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      setResetStep('code-sent');
      setCodeResendTimer(60);
      const interval = setInterval(() => {
        setCodeResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code.';
      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    if (verificationCode.length !== 6) {
      setResetError('Please enter the 6-digit verification code.');
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: verificationCode,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setResetStep('success');
      setNewPassword('');
      setConfirmPassword('');
      setVerificationCode('');
      window.setTimeout(() => {
        setResetStep('form');
      }, 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (codeResendTimer > 0) return;
    setResetLoading(true);
    setResetError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      setCodeResendTimer(60);
      const interval = setInterval(() => {
        setCodeResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend code.';
      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 md:pb-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your organization&apos;s configuration and personal preferences.</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto custom-scrollbar -mx-[10px] md:mx-0 px-[10px] md:px-0">
        <div className="flex min-w-max gap-4 md:gap-6 border-b border-border/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-1.5 md:gap-2 border-b-2 px-1 md:px-2 pb-3 md:pb-4 text-xs md:text-sm font-medium transition-all',
                  tab.id === 'appearance' && 'hidden md:flex',
                  active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="glass-card md:col-span-2 rounded-xl md:rounded-2xl border-border/50">
            <CardContent className="p-4 md:p-5">
              <div className="mb-4 md:mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-semibold">Personal Details</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Update your name, bio and company role.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => setEditingProfile((v) => !v)}>
                  <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    {editingProfile ? (
                      <Input
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="rounded-lg md:rounded-xl text-xs md:text-sm h-10 md:h-12 bg-background"
                      />
                    ) : (
                      <div className="rounded-lg md:rounded-xl border border-border/50 bg-muted/50 p-2.5 md:p-3 text-xs md:text-sm">{user.name}</div>
                    )}
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    {editingProfile ? (
                      <Input
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        className="rounded-lg md:rounded-xl text-xs md:text-sm h-10 md:h-12 bg-background"
                      />
                    ) : (
                      <div className="rounded-lg md:rounded-xl border border-border/50 bg-muted/50 p-2.5 md:p-3 text-xs md:text-sm">{user.email}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-1 md:space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Number</label>
                  <div className="flex items-center justify-between rounded-lg md:rounded-xl border border-border/50 bg-muted/50 p-2.5 md:p-3">
                    <span className="font-mono text-xs md:text-sm font-bold text-primary">{accountNumber}</span>
                    <button onClick={handleCopyAccount} className="text-muted-foreground hover:text-primary transition-colors">
                      {copied ? <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" /> : <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 md:space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Bio</label>
                  {editingProfile ? (
                    <Input
                      value={draft.bio}
                      onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                      placeholder="Tell us about your role"
                      className="rounded-lg md:rounded-xl text-xs md:text-sm h-10 md:h-12 bg-background"
                    />
                  ) : (
                    <div className="rounded-lg md:rounded-xl border border-border/50 bg-muted/50 p-2.5 md:p-3 text-xs md:text-sm italic text-muted-foreground">
                      {user.bio || 'Senior Account Executive managing enterprise communications.'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="glass-card rounded-xl md:rounded-2xl border-border/50">
              <CardContent className="flex flex-col items-center p-4 md:p-5 text-center">
                <div className="mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h4 className="text-base md:text-lg font-semibold text-primary">Active</h4>
                <p className="mb-4 text-[10px] md:text-xs text-muted-foreground">Two-Factor Authentication is currently securing your account.</p>
                <Button variant="outline" className="w-full text-xs md:text-sm h-9 md:h-10">Configure 2FA</Button>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-xl md:rounded-2xl border-border/50">
              <CardContent className="p-4 md:p-5">
                <h4 className="mb-3 md:mb-4 text-sm font-semibold">Appearance</h4>
                <div className="space-y-2">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const active = theme === t.id;
                    return (
                      <label
                        key={t.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-lg md:rounded-xl border p-2.5 md:p-3 transition-all',
                          active ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/30 hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="text-xs md:text-sm font-medium">{t.label}</span>
                        </div>
                        <input
                          type="radio"
                          name="theme"
                          checked={active}
                          onChange={() => setTheme(t.id as typeof theme)}
                          className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary focus:ring-primary/20"
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
        <Card className="glass-card rounded-xl md:rounded-2xl border-border/50">
          <CardContent className="p-4 md:p-5">
            <div className="mb-3 md:mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">Telnyx Sender Number</h3>
            </div>
            <p className="mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">Verify and set the phone number used to send SMS from the web.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                type="tel"
                value={numberDraft}
                onChange={(e) => setNumberDraft(e.target.value)}
                placeholder="+14237303370"
                className="flex-1 h-10 md:h-11 rounded-lg md:rounded-xl bg-background"
              />
              <Button onClick={handleVerifyNumber} disabled={verifying || !numberDraft.trim()} className="h-10 md:h-11 rounded-lg md:rounded-xl shrink-0 text-xs md:text-sm">
                {verifying && <Loader2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />}
                Verify
              </Button>
            </div>
            {verifyStatus && (
              <div
                className={cn(
                  'mt-3 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm',
                  verifyStatus.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {verifyStatus.type === 'success' ? <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                {verifyStatus.message}
              </div>
            )}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
              <Button onClick={handleSaveNumber} disabled={!numberDraft.trim()} className="w-full sm:w-auto h-10 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm">
                Save Number
              </Button>
              {telnyxNumber && (
                <span className="text-[10px] md:text-sm text-muted-foreground text-center sm:text-left">
                  Current: <span className="font-bold text-foreground">{telnyxNumber}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card className="glass-card rounded-xl md:rounded-2xl border-border/50">
          <CardContent className="p-4 md:p-5">
            <h3 className="mb-2 md:mb-4 text-base md:text-lg font-semibold">Appearance</h3>
            <p className="mb-4 text-xs md:text-sm text-muted-foreground">Choose how the dashboard looks.</p>
            <div className="grid gap-2 md:gap-3 grid-cols-1 sm:grid-cols-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as typeof theme)}
                    className={cn(
                      'flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 rounded-lg md:rounded-xl border p-3 md:p-4 transition-all',
                      active ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/50 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-2 sm:flex-col sm:gap-2">
                      <Icon className="h-4 w-4 md:h-6 md:w-6" />
                      <span className="text-xs md:text-sm font-medium">{t.label}</span>
                    </div>
                    {active && <CheckCircle className="h-4 w-4 sm:hidden text-primary" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="glass-card rounded-xl md:rounded-2xl border-border/50">
          <CardContent className="p-4 md:p-5">
            <h3 className="mb-1 text-base md:text-lg font-semibold">Notifications</h3>
            <p className="mb-4 text-xs md:text-sm text-muted-foreground">Manage notification history.</p>
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium p-3 bg-muted/50 rounded-lg inline-block border border-border/50">
              You have <span className="font-bold text-foreground">{notifications.length}</span> stored notification{notifications.length === 1 ? '' : 's'}.
            </p>
            <div className="mt-4">
              <Button variant="outline" className="w-full sm:w-auto rounded-lg md:rounded-xl text-xs md:text-sm h-10 md:h-11" onClick={clearNotifications}>
                <RotateCcw className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                Clear All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <>
        <Card className="glass-card overflow-hidden rounded-xl md:rounded-2xl border-border/50">
          <div className="flex items-center justify-between border-b border-border/30 p-4 md:p-5">
            <h3 className="text-base md:text-lg font-semibold">Security &amp; Access</h3>
            <span className="rounded bg-primary/10 px-2 py-1 text-[9px] md:text-xs font-bold uppercase tracking-widest text-primary hidden md:inline-block">
              Real-time monitoring
            </span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-muted text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 md:px-5 py-2.5 md:py-4 whitespace-nowrap">Device</th>
                  <th className="px-3 md:px-5 py-2.5 md:py-4 whitespace-nowrap hidden sm:table-cell">Location</th>
                  <th className="px-3 md:px-5 py-2.5 md:py-4 whitespace-nowrap hidden sm:table-cell">IP Address</th>
                  <th className="px-3 md:px-5 py-2.5 md:py-4 whitespace-nowrap">Last Activity</th>
                  <th className="px-3 md:px-5 py-2.5 md:py-4 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {sessions.map((session) => {
                  const Icon = session.icon;
                  return (
                    <tr key={session.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-3 md:px-5 py-3 md:py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-3.5 w-3.5 md:h-4 md:w-4 shrink-0', session.current ? 'text-primary' : 'text-muted-foreground')} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] md:text-sm font-medium truncate">{session.device}</span>
                            <span className="sm:hidden text-[9px] text-muted-foreground truncate">{session.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-5 py-3 md:py-4 text-[11px] md:text-sm whitespace-nowrap hidden sm:table-cell">{session.location}</td>
                      <td className="px-3 md:px-5 py-3 md:py-4 font-mono text-[11px] md:text-sm whitespace-nowrap hidden sm:table-cell">{session.ip}</td>
                      <td className="px-3 md:px-5 py-3 md:py-4 whitespace-nowrap">
                        {session.current ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-xs font-bold text-amber-700">
                            <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-amber-600" />
                            <span className="hidden md:inline">Current Session</span>
                            <span className="md:hidden">Current</span>
                          </span>
                        ) : (
                          <span className="text-[10px] md:text-sm text-muted-foreground">2 hrs ago</span>
                        )}
                      </td>
                      <td className="px-3 md:px-5 py-3 md:py-4">
                        <button className="text-[10px] md:text-sm font-medium text-destructive hover:underline">Revoke</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/30 p-4 md:p-5">
            <Button variant="destructive" className="w-full sm:w-auto h-10 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              Log Out
            </Button>
          </div>
        </Card>

        {/* Password Reset Section */}
        <Card className="glass-card rounded-xl md:rounded-2xl border-border/50">
          <CardContent className="p-4 md:p-5">
            <div className="mb-3 md:mb-4 flex items-center gap-2 border-b border-border/30 pb-3">
              <KeyRound className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">Reset Password</h3>
            </div>

            {resetStep === 'success' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm font-bold text-foreground">Password Changed Successfully</p>
                <p className="mt-1 text-xs text-muted-foreground">Your password has been updated. You can continue using your account securely.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs md:text-sm text-muted-foreground">
                  Enter a new password below. A 6-digit verification code will be sent to <span className="font-bold text-foreground">{user.email}</span> to confirm the change.
                </p>

                {resetStep === 'form' && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pl-9 pr-9 h-10 md:h-11 rounded-lg md:rounded-xl bg-background text-xs md:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pl-9 pr-9 h-10 md:h-11 rounded-lg md:rounded-xl bg-background text-xs md:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                        </button>
                      </div>
                    </div>

                    {resetError && (
                      <div className="flex items-center gap-1.5 text-[10px] md:text-sm text-red-500">
                        <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                        {resetError}
                      </div>
                    )}

                    <Button
                      onClick={handleSendResetCode}
                      disabled={resetLoading || !newPassword || !confirmPassword}
                      className="w-full h-10 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm"
                    >
                      {resetLoading ? (
                        <><Loader2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />Sending Code...</>
                      ) : (
                        <><Mail className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />Send Verification Code</>
                      )}
                    </Button>
                  </div>
                )}

                {resetStep === 'code-sent' && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 rounded-lg md:rounded-xl bg-primary/5 border border-primary/30 p-3">
                      <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                      <p className="text-[10px] md:text-sm text-foreground">
                        A 6-digit code was sent to <span className="font-bold text-primary">{user.email}</span>. Enter it below to confirm your password reset.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full h-12 md:h-14 rounded-lg md:rounded-xl border border-border bg-background text-center text-xl md:text-2xl font-bold tracking-[0.5em] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                      />
                    </div>

                    {resetError && (
                      <div className="flex items-center gap-1.5 text-[10px] md:text-sm text-red-500">
                        <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                        {resetError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <Button
                        onClick={handleVerifyAndReset}
                        disabled={resetLoading || verificationCode.length !== 6}
                        className="flex-1 h-10 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm"
                      >
                        {resetLoading ? (
                          <><Loader2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />Verifying...</>
                        ) : (
                          <><ShieldCheck className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />Verify &amp; Reset Password</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResendCode}
                        disabled={resetLoading || codeResendTimer > 0}
                        className="h-10 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm shrink-0"
                      >
                        {codeResendTimer > 0 ? `Resend in ${codeResendTimer}s` : 'Resend Code'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setResetStep('form'); setVerificationCode(''); setResetError(null); }}
                        className="h-10 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm shrink-0"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        </>
      )}

      {/* Action Bar */}
      {activeTab === 'profile' && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 md:gap-3 rounded-xl md:rounded-2xl bg-muted/50 p-3 md:p-4 border border-border/50">
          <Button variant="ghost" className="w-full sm:w-auto text-xs md:text-sm h-10 md:h-11 rounded-lg md:rounded-xl" onClick={() => { setEditingProfile(false); setDraft({ ...draft, name: user.name, email: user.email, bio: user.bio ?? '' }); }}>
            Discard Changes
          </Button>
          <Button className="w-full sm:w-auto text-xs md:text-sm h-10 md:h-11 rounded-lg md:rounded-xl" onClick={handleSave} disabled={saved}>
            {saved && <Check className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />}
            {saved ? 'Saved' : 'Save Settings'}
          </Button>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-24 right-4 md:bottom-10 md:right-10 z-50 flex items-center gap-2 md:gap-3 rounded-xl bg-foreground p-3 md:p-4 text-background shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-green-500 shrink-0">
            <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-bold">Settings Saved</p>
            <p className="text-[10px] md:text-xs opacity-80 leading-tight">Your profile changes have been synchronized.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Settings);
