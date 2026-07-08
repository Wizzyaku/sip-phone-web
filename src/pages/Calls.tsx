import { useEffect, useRef, useState, memo } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useSip } from '../hooks/useSip';
import { cn } from '../lib/utils';

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Calls() {
  const { status, error, activeCall, register, call, hangup, toggleMute, toggleSpeaker, acceptCall, rejectCall } = useSip();
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [settings, setSettings] = useState({
    username: '',
    password: '',
    phoneNumber: '',
  });
  const [number, setNumber] = useState('');

  const handleDial = (digit: string) => setNumber((n) => n + digit);
  const handleBackspace = () => setNumber((n) => n.slice(0, -1));
  const handleCall = () => {
    if (!number.trim()) return;
    call(number.trim());
  };

  useEffect(() => {
    if (activeCall?.remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = activeCall.remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [activeCall?.remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !activeCall?.speakerOn;
    }
  }, [activeCall?.speakerOn]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calls</h1>
        <p className="text-muted-foreground">SIP softphone powered by Telnyx.</p>
      </div>

      <audio ref={remoteAudioRef} className="hidden" />

      {activeCall && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full bg-primary/10',
                  activeCall.status === 'Ringing' && 'animate-pulse',
                  activeCall.status === 'Connecting' && 'animate-pulse'
                )}
              >
                <Phone
                  className={cn(
                    'h-7 w-7 text-primary',
                    activeCall.status === 'Ringing' && 'animate-bounce',
                    activeCall.status === 'Connecting' && 'animate-bounce'
                  )}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {activeCall.direction === 'incoming' ? 'Incoming call' : 'Outgoing call'}
                </p>
                <p className="text-xl font-semibold">{activeCall.remoteIdentity}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline">{activeCall.status}</Badge>
                  {activeCall.status === 'In call' && activeCall.startTime && (
                    <Badge variant="secondary">{formatDuration(activeCall.durationSeconds)}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {activeCall.direction === 'incoming' && activeCall.status === 'Ringing' ? (
                <>
                  <Button variant="default" size="icon" onClick={acceptCall} aria-label="Accept call">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={rejectCall} aria-label="Reject call">
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleMute}
                    aria-label={activeCall.muted ? 'Unmute' : 'Mute'}
                  >
                    {activeCall.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSpeaker}
                    aria-label={activeCall.speakerOn ? 'Turn speaker off' : 'Turn speaker on'}
                  >
                    {activeCall.speakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={hangup} aria-label="Hang up">
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>SIP Registration</CardTitle>
            <CardDescription>Enter your Telnyx SIP username, password, and phone number. Everything else is configured automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
            <Button
              className="w-full"
              onClick={() => register(settings)}
              disabled={status === 'connecting' || status === 'registered'}
            >
              {status === 'connecting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status === 'registered' ? 'Registered' : status === 'connecting' ? 'Connecting...' : 'Register'}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  status === 'registered' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                )}
              />
              Status: {status}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dial Pad</CardTitle>
            <CardDescription>Enter a number or SIP URI and press call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="+15551234567"
                className="flex-1 text-center text-lg tracking-widest"
              />
              <Button variant="outline" size="icon" onClick={handleBackspace}>
                ⌫
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {keypad.map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDial(digit)}
                  className={cn(
                    'h-14 rounded-lg border bg-background text-lg font-medium transition-colors hover:bg-accent',
                    activeCall ? 'cursor-not-allowed opacity-50' : ''
                  )}
                  disabled={!!activeCall}
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleCall}
                disabled={status !== 'registered' || !!activeCall}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={hangup}
                disabled={!activeCall}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                Hang up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(Calls);
