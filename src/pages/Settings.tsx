import { useState, memo } from 'react';
import { Monitor, Moon, Sun, Bell, RotateCcw, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Settings() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const notifications = useAppStore((s) => s.notifications);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const telnyxNumber = useAppStore((s) => s.telnyxNumber);
  const setTelnyxNumber = useAppStore((s) => s.setTelnyxNumber);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ name: user.name, email: user.email, avatar: user.avatar });
  const [numberDraft, setNumberDraft] = useState(telnyxNumber ?? '');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = () => {
    setUser({ ...user, ...draft, avatar: getInitials(draft.name) });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and appearance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how the dashboard looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                    active ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent'
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

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {draft.avatar || getInitials(draft.name)}
            </div>
            <div>
              <p className="font-medium">{draft.name}</p>
              <p className="text-sm text-muted-foreground">{draft.email}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Name"
            />
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="Email"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Profile</Button>
            {saved && <span className="self-center text-sm text-emerald-600">Saved!</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Telnyx Sender Number
          </CardTitle>
          <CardDescription>Verify and set the phone number used to send SMS from the web.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                'flex items-center gap-2 text-sm',
                verifyStatus.type === 'success' ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {verifyStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {verifyStatus.message}
            </div>
          )}
          <div className="flex items-center gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage notification history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You have {notifications.length} stored notification{notifications.length === 1 ? '' : 's'}.
          </p>
          <Button variant="outline" onClick={clearNotifications}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear All Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(Settings);
