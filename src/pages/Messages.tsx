import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import axios from 'axios';
import {
  Send,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  X,
  Search,
  AlertCircle,
  CheckCheck,
  FileAudio,
  Phone,
  Video as VideoIcon,
  MoreVertical,
  ArrowLeft,
  PlusCircle,
  PenSquare,
  Smile,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
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

type FilterTab = 'all' | 'unread' | 'groups';

function getInitials(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(-2).toUpperCase() || '??';
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
  const [filter, setFilter] = useState<FilterTab>('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeNumber, setComposeNumber] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.unreadCount > 0);
    if (filter === 'groups') list = list.filter((c) => c.contact.includes('+') && c.contact.length > 12);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.contact.toLowerCase().includes(query) ||
        c.contactName?.toLowerCase().includes(query) ||
        c.lastMessage?.body.toLowerCase().includes(query)
    );
  }, [conversations, search, filter]);

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

  const handleStartConversation = (e: React.FormEvent) => {
    e.preventDefault();
    const number = composeNumber.trim();
    if (!number) return;
    const existing = conversations.find((c) => c.contact === number);
    if (existing) {
      handleSelectConversation(existing.id);
    } else {
      const id = number;
      useAppStore.getState().setConversations([
        { id, contact: number, avatar: getInitials(number), unreadCount: 0, messages: [] },
        ...conversations,
      ]);
      setActiveConversation(id);
      setTo(number);
    }
    setComposeNumber('');
    setComposeOpen(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaUploads.length > 0) {
      mediaUploads.forEach((u) => handleSendMedia(u.id));
    }
    sendTextMessage();
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' },
  ];

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-0 overflow-hidden rounded-2xl glass-card md:flex-row">
      {/* Left Pane */}
      <section className="flex h-full w-full flex-col border-r border-border/20 md:w-[360px]">
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Messages</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setComposeOpen((v) => !v)} title="New conversation">
                <PenSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={loading} title="Refresh messages">
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
          {composeOpen && (
            <form onSubmit={handleStartConversation} className="flex items-center gap-2">
              <Input
                type="tel"
                value={composeNumber}
                onChange={(e) => setComposeNumber(e.target.value)}
                placeholder="Enter phone number"
                className="h-9 flex-1 rounded-lg text-xs"
                autoFocus
              />
              <Button type="submit" size="sm" className="h-9 rounded-lg px-3 text-xs">
                Start
              </Button>
            </form>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  filter === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loading && filteredConversations.length === 0 && (
            <div className="space-y-3 p-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
          {filteredConversations.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <MessageSquare className="mb-3 h-10 w-10 opacity-50" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="mb-4 max-w-[200px] text-xs">
                Messages are fetched in real time. Start a conversation or check back once messages arrive.
              </p>
              {error && <p className="mb-3 max-w-[220px] text-xs text-destructive">{error}</p>}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setComposeOpen(true)}
              >
                <PenSquare className="mr-2 h-3.5 w-3.5" />
                New conversation
              </Button>
            </div>
          )}
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = activeId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all',
                    isActive ? 'border border-primary/10 bg-white shadow-sm' : 'hover:bg-primary/5'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                      <AvatarFallback>{getInitials(conv.contactName || conv.contact)}</AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={cn('truncate font-semibold', isActive && 'text-primary')}>
                        {conv.contactName || conv.contact}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {conv.lastMessage && formatRelative(conv.lastMessage.createdAt)}
                      </span>
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Center Pane */}
      <section className="flex h-full flex-1 flex-col bg-card">
        {activeConversation ? (
          <>
            <header className="flex h-16 items-center justify-between border-b border-border/10 px-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="-ml-2 md:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                  <AvatarFallback>
                    {getInitials(activeConversation.contactName || activeConversation.contact)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold leading-none">
                    {activeConversation.contactName || activeConversation.contact}
                  </h2>
                  <p className="text-[11px] font-medium text-emerald-500">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <VideoIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4">
              <div className="flex justify-center">
                <span className="rounded-full bg-muted px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Today
                </span>
              </div>
              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex max-w-[85%]',
                    msg.direction === 'outbound' ? 'ml-auto justify-end' : 'justify-start'
                  )}
                >
                  {msg.direction === 'inbound' && (
                    <Avatar className="mr-2 h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback>
                        {getInitials(activeConversation.contactName || activeConversation.contact)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1">
                    <div
                      className={cn(
                        'relative rounded-2xl p-3 text-sm group',
                        msg.direction === 'outbound'
                          ? 'rounded-tr-none bg-primary text-primary-foreground'
                          : 'rounded-tl-none border bg-white text-foreground'
                      )}
                    >
                      <MessageContent msg={msg} />
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1 text-[10px] text-muted-foreground',
                        msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.direction === 'outbound' && msg.status === 'read' && (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <footer className="border-t border-border/10 bg-card p-4">
              {error && (
                <div className="mb-2 flex items-center gap-2 text-sm text-destructive">
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
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex items-center gap-1 pb-1">
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
                    className="rounded-full"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="To"
                    className="mb-2 h-8 rounded-lg px-3 text-xs"
                  />
                  <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-border bg-muted px-4 py-3 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" className="absolute bottom-2.5 right-3 text-muted-foreground hover:text-primary">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-xl"
                  disabled={sending || !to.trim() || !telnyxNumber || (mediaUploads.length === 0 && !body.trim())}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-card p-6 text-center text-muted-foreground">
            <MessageSquare className="mb-3 h-12 w-12 opacity-50" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm">Choose a contact from the sidebar to start chatting.</p>
          </div>
        )}
      </section>

    </div>
  );
}

export default memo(Messages);
