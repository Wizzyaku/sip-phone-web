import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { useSip, type ActiveCall } from '../hooks/useSip';
import { fetchSipCredentials } from '../lib/sipCredentials';
import { useAppStore } from '../store/appStore';

interface SipContextValue {
  status: ReturnType<typeof useSip>['status'];
  error: ReturnType<typeof useSip>['error'];
  activeCall: ActiveCall | null;
  register: ReturnType<typeof useSip>['register'];
  unregister: ReturnType<typeof useSip>['unregister'];
  call: ReturnType<typeof useSip>['call'];
  hangup: ReturnType<typeof useSip>['hangup'];
  toggleMute: ReturnType<typeof useSip>['toggleMute'];
  toggleSpeaker: ReturnType<typeof useSip>['toggleSpeaker'];
  acceptCall: ReturnType<typeof useSip>['acceptCall'];
  rejectCall: ReturnType<typeof useSip>['rejectCall'];
}

const SipContext = createContext<SipContextValue | null>(null);

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SipProvider({ children }: { children: ReactNode }) {
  const sip = useSip();
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const setSipSettings = useAppStore((s) => s.setSipSettings);

  useEffect(() => {
    let mounted = true;
    fetchSipCredentials().then((settings) => {
      if (mounted && settings) {
        setSipSettings(settings);
      }
    });
    return () => {
      mounted = false;
    };
  }, [setSipSettings]);

  useEffect(() => {
    if (sip.activeCall?.remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = sip.activeCall.remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [sip.activeCall?.remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !sip.activeCall?.speakerOn;
    }
  }, [sip.activeCall?.speakerOn]);

  return (
    <SipContext.Provider value={sip}>
      {children}
      <audio ref={remoteAudioRef} className="hidden" />
      <IncomingCallBanner />
    </SipContext.Provider>
  );
}

function IncomingCallBanner() {
  const { activeCall, hangup, toggleMute, toggleSpeaker, acceptCall, rejectCall } = useSipContext();

  if (!activeCall) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 p-4">
      <Card className="mx-auto max-w-xl border-primary/20 bg-primary/5 shadow-lg">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row sm:p-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:h-14 sm:w-14',
                (activeCall.status === 'Ringing' || activeCall.status === 'Connecting') && 'animate-pulse'
              )}
            >
              <Phone
                className={cn(
                  'h-6 w-6 text-primary sm:h-7 sm:w-7',
                  (activeCall.status === 'Ringing' || activeCall.status === 'Connecting') && 'animate-bounce'
                )}
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                {activeCall.direction === 'incoming' ? 'Incoming call' : 'Outgoing call'}
              </p>
              <p className="text-lg font-semibold sm:text-xl">{activeCall.remoteIdentity}</p>
              <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
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
                <Button variant="outline" size="icon" onClick={toggleMute} aria-label={activeCall.muted ? 'Unmute' : 'Mute'}>
                  {activeCall.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={toggleSpeaker} aria-label={activeCall.speakerOn ? 'Turn speaker off' : 'Turn speaker on'}>
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
    </div>
  );
}

export function useSipContext() {
  const context = useContext(SipContext);
  if (!context) {
    throw new Error('useSipContext must be used within a SipProvider');
  }
  return context;
}
