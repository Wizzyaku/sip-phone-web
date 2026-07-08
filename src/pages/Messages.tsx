import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import axios from 'axios';
import {
  Send,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Mic,
  X,
  Search,
  AlertCircle,
  Check,
  FileAudio,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { useAppStore, type Message, type MessageType } from '../store/appStore';

interface SmsMessage {
  sid: string;
  from: string;
  to: string;
  body: string;
  direction: 'inbound' | 'outbound';
  dateCreated: string;
  status?: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

function getInitials(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(-2).toUpperCase() || '??';
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageContent({ msg }: { msg: Message }) {
  if (msg.type === 'image' && msg.mediaUrl) {
    return (
      <img
        src={msg.mediaUrl}
        alt={msg.mediaName || 'Image'}
        className="max-h-48 rounded-md object-cover"
      />
    );
  }
  if (msg.type === 'video' && msg.mediaUrl) {
    return (
      <video src={msg.mediaUrl} controls className="max-h-48 rounded-md">
        Your browser does not support the video tag.
      </video>
    );
  }
  if (msg.type === 'audio' && msg.mediaUrl) {
    return (
      <div className="flex items-center gap-2">
        <FileAudio className="h-5 w-5 shrink-0" />
        <audio src={msg.mediaUrl} controls className="max-w-[200px]" />
      </div>
    );
  }
  return <span className="break-words">{msg.body}</span>;
}

export function Messages() {
  const conversations = useAppStore((s) => s.conversations);
  const activeId = useAppStore((s) => s.activeConversation);
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const setStoreMessages = useAppStore((s) => s.setMessages);
  const addStoreMessage = useAppStore((s) => s.addMessage);
  const mediaUploads = useAppStore((s) => s.mediaUploads);
  const addMediaUpload = useAppStore((s) => s.addMediaUpload);
  const removeMediaUpload = useAppStore((s) => s.removeMediaUpload);
  const telnyxNumber = useAppStore((s) => s.telnyxNumber);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter(
      (c) =>
        c.contact.toLowerCase().includes(query) ||
        c.contactName?.toLowerCase().includes(query) ||
        c.lastMessage?.body.toLowerCase().includes(query)
    );
  }, [conversations, search]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/messages`);
      const apiMessages: SmsMessage[] = res.data;
      const mapped: Message[] = apiMessages.map((m) => ({
        id: m.sid,
        conversationId: m.from === m.to ? m.to : [m.from, m.to].sort().join('|'),
        from: m.from,
        to: m.to,
        body: m.body,
        type: 'text',
        direction: m.direction,
        status: m.status || 'received',
        createdAt: m.dateCreated,
      }));
      const current = useAppStore.getState().messages;
      const merged = [...current.filter((sm) => !mapped.some((m) => m.id === sm.id))];
      setStoreMessages([...mapped, ...merged]);
    } catch (err) {
      setError('Failed to load messages. Using local messages only.');
    } finally {
      setLoading(false);
    }
  }, [setStoreMessages]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      setTo(conversation.contact);
    }
  };

  const sendTextMessage = async () => {
    if (!to.trim() || !body.trim()) return;
    if (!telnyxNumber) {
      setError('No sender number configured. Go to Settings and verify your Telnyx number.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/send-sms`, {
        to: to.trim(),
        body: body.trim(),
        from: telnyxNumber,
      });
      addStoreMessage({
        id: res.data.sid || crypto.randomUUID(),
        conversationId: to.trim(),
        from: telnyxNumber,
        to: to.trim(),
        body: body.trim(),
        type: 'text',
        direction: 'outbound',
        status: res.data.status || 'sent',
        createdAt: new Date().toISOString(),
      });
      setBody('');
      await fetchMessages();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendMediaMessage = (type: MessageType, file: File, url: string) => {
    if (!to.trim() || !telnyxNumber) return;
    addStoreMessage({
      id: crypto.randomUUID(),
      conversationId: to.trim(),
      from: telnyxNumber,
      to: to.trim(),
      body: type === 'audio' ? 'Voice message' : file.name,
      type,
      mediaUrl: url,
      mediaName: file.name,
      direction: 'outbound',
      status: 'sent',
      createdAt: new Date().toISOString(),
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const upload = {
      id: crypto.randomUUID(),
      file,
      previewUrl: url,
      type,
      uploading: false,
    };
    addMediaUpload(upload);
    e.target.value = '';
  };

  const handleSendMedia = (uploadId: string) => {
    const upload = mediaUploads.find((u) => u.id === uploadId);
    if (!upload) return;
    sendMediaMessage(upload.type, upload.file, upload.previewUrl);
    removeMediaUpload(uploadId);
  };

  const handleRemoveMedia = (uploadId: string) => {
    const upload = mediaUploads.find((u) => u.id === uploadId);
    if (upload?.previewUrl) URL.revokeObjectURL(upload.previewUrl);
    removeMediaUpload(uploadId);
  };

  const startRecording = async () => {
    try {
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        const url = URL.createObjectURL(file);
        const upload = {
          id: crypto.randomUUID(),
          file,
          previewUrl: url,
          type: 'audio' as MessageType,
          uploading: false,
        };
        addMediaUpload(upload);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.onerror = () => {
        setRecordingError('Recording failed');
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setRecordingError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaUploads.length > 0) {
      mediaUploads.forEach((u) => handleSendMedia(u.id));
    }
    sendTextMessage();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <Card className="flex w-full flex-col lg:w-80">
        <div className="border-b p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Conversations</h2>
            <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading && filteredConversations.length === 0 && (
            <div className="space-y-3 p-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}
          {filteredConversations.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs">Select a contact or type a number to start chatting.</p>
            </div>
          )}
          <div className="space-y-1">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                  activeId === conv.id ? 'bg-accent' : 'hover:bg-accent/50'
                )}
              >
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                  <AvatarFallback>{getInitials(conv.contactName || conv.contact)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{conv.contactName || conv.contact}</p>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 min-w-[1.25rem] justify-center px-1.5 text-[10px]">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.lastMessage?.type === 'text'
                      ? conv.lastMessage.body
                      : conv.lastMessage
                      ? `Sent ${conv.lastMessage.type}`
                      : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {activeConversation ? (
          <>
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                  <AvatarFallback>{getInitials(activeConversation.contactName || activeConversation.contact)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold">{activeConversation.contactName || activeConversation.contact}</p>
                  <p className="text-xs text-muted-foreground">SMS / MMS</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeConversation.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No messages in this conversation.
                </div>
              ) : (
                activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                        msg.direction === 'outbound'
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm bg-muted text-foreground'
                      )}
                    >
                      <MessageContent msg={msg} />
                      <p
                        className={cn(
                          'mt-1 text-[10px] opacity-70',
                          msg.direction === 'outbound' ? 'text-right' : 'text-left'
                        )}
                      >
                        {formatTime(msg.createdAt)}
                        {msg.direction === 'outbound' && msg.status === 'read' && (
                          <span className="ml-1">
                            <Check className="inline h-3 w-3" />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <MessageSquare className="mb-3 h-12 w-12 opacity-50" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm">Choose a contact from the sidebar or type a number below.</p>
          </div>
        )}

        <CardContent className="border-t p-4">
          {error && (
            <div className="mb-2 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {mediaUploads.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {mediaUploads.map((upload) => (
                <div key={upload.id} className="relative rounded-md border p-2">
                  {upload.type === 'image' ? (
                    <img src={upload.previewUrl} alt="preview" className="h-16 w-16 rounded object-cover" />
                  ) : upload.type === 'video' ? (
                    <video src={upload.previewUrl} className="h-16 w-16 rounded object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                      <FileAudio className="h-6 w-6" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(upload.id)}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive text-destructive-foreground p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {recordingError && <p className="mb-2 text-xs text-red-500">{recordingError}</p>}
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Input
                type="tel"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="To: +1234567890"
                className="h-9"
              />
              <Input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type a message..."
                className="h-10"
                disabled={isRecording}
              />
            </div>
            <div className="flex items-center gap-1">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'image')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'video')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                aria-label="Attach image"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => videoInputRef.current?.click()}
                aria-label="Attach video"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'ghost'}
                size="icon"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={isRecording ? stopRecording : undefined}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                aria-label="Record voice"
              >
                <Mic className={cn('h-5 w-5', isRecording && 'animate-pulse')} />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={sending || !to.trim() || !telnyxNumber || (mediaUploads.length === 0 && !body.trim())}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(Messages);
