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
  Check,
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
import { useIsDesktop } from '../hooks/useIsDesktop';
import { MobileMessages } from '../components/MobileMessages';

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
type MobileFilterTab = 'all' | 'sms' | 'webchat';

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
        className="max-h-32 rounded-md object-cover md:max-h-48"
      />
    );
  }
  if (msg.type === 'video' && msg.mediaUrl) {
    return (
      <video src={msg.mediaUrl} controls className="max-h-32 rounded-md md:max-h-48">
        Your browser does not support the video tag.
      </video>
    );
  }
  if (msg.type === 'audio' && msg.mediaUrl) {
    return (
      <div className="flex items-center gap-2">
        <FileAudio className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
        <audio src={msg.mediaUrl} controls className="max-w-[140px] md:max-w-[200px]" />
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
  const [mobileFilter, setMobileFilter] = useState<MobileFilterTab>('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeNumber, setComposeNumber] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDesktop = useIsDesktop();

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
    const currentNumber = useAppStore.getState().telnyxNumber;
    try {
      const res = await axios.get(`${API_URL}/messages`);
      const apiMessages: SmsMessage[] = res.data;
      const mapped: Message[] = apiMessages.map((m) => {
        const isFromMe = currentNumber ? m.from.trim() === currentNumber.trim() : m.direction === 'outbound';
        return {
          id: m.sid,
          conversationId: m.from === m.to ? m.to : getConversationId(m.from, m.to),
          from: m.from,
          to: m.to,
          body: m.body,
          type: 'text' as MessageType,
          direction: isFromMe ? ('outbound' as const) : ('inbound' as const),
          status: m.status || (isFromMe ? 'sent' : 'received'),
          createdAt: m.dateCreated,
        };
      });
      const current = useAppStore.getState().messages;
      const merged = current.map((sm) => {
        const apiMatch = mapped.find((m) => m.id === sm.id);
        if (!apiMatch) return sm;
        // Keep our local direction if it differs from the API's direction.
        return sm.direction === 'outbound' ? { ...apiMatch, direction: 'outbound' as const } : apiMatch;
      });
      const newApiMessages = mapped.filter((m) => !current.some((sm) => sm.id === m.id));
      setStoreMessages([...merged, ...newApiMessages]);
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
    setMobileChatOpen(true);
  };

  const handleStartConversation = (e: React.FormEvent) => {
    e.preventDefault();
    const number = composeNumber.trim();
    if (!number) return;
    const id = telnyxNumber ? getConversationId(telnyxNumber, number) : number;
    const existing = conversations.find((c) => c.id === id || c.contact === number);
    if (existing) {
      handleSelectConversation(existing.id);
    } else {
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

  const getConversationId = (a: string, b: string) =>
    a === b ? a : [a.trim(), b.trim()].sort().join('|');

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
        conversationId: getConversationId(telnyxNumber, to.trim()),
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
      conversationId: getConversationId(telnyxNumber, to.trim()),
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
    <div className="relative -mx-4 h-[calc(100vh-8rem)] min-w-0 max-w-full overflow-hidden bg-background md:mx-0 md:h-[calc(100vh-7.5rem)] md:rounded-2xl md:border md:border-border/30">
      {!isDesktop && (
        <MobileMessages
          conversations={conversations}
          activeConversation={activeConversation}
          loading={loading}
          error={error}
          telnyxNumber={telnyxNumber}
          to={to}
          body={body}
          sending={sending}
          search={search}
          mobileFilter={mobileFilter}
          composeNumber={composeNumber}
          composeOpen={composeOpen}
          mediaUploads={mediaUploads}
          imageInputRef={imageInputRef}
          videoInputRef={videoInputRef}
          textareaRef={textareaRef}
          chatEndRef={chatEndRef}
          setSearch={setSearch}
          setMobileFilter={setMobileFilter}
          setComposeOpen={setComposeOpen}
          setComposeNumber={setComposeNumber}
          setBody={setBody}
          setTo={setTo}
          handleSelectConversation={handleSelectConversation}
          handleStartConversation={handleStartConversation}
          sendTextMessage={sendTextMessage}
          handleSubmit={handleSubmit}
          handleFileSelect={handleFileSelect}
          handleRemoveMedia={handleRemoveMedia}
          fetchMessages={fetchMessages}
        />
      )}
      {isDesktop && (
        <div className="glass-card flex h-full flex-col gap-0 overflow-hidden md:flex-row">
      {/* Left Pane */}
      <section className={cn('flex h-full w-full flex-col border-r border-border/20 md:w-[360px]', mobileChatOpen && 'hidden md:flex')}>
        <div className="space-y-2 p-2.5 md:space-y-3 md:p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold md:text-xl">Messages</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={() => setComposeOpen((v) => !v)} title="New conversation">
                <PenSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={fetchMessages} disabled={loading} title="Refresh messages">
                <RefreshCw className={cn('h-3.5 w-3.5 md:h-4 md:w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
          {composeOpen && (
            <form onSubmit={handleStartConversation} className="flex items-center gap-1.5">
              <Input
                type="tel"
                value={composeNumber}
                onChange={(e) => setComposeNumber(e.target.value)}
                placeholder="Enter phone number"
                className="h-8 flex-1 rounded-md text-[10px] md:h-9 md:rounded-lg md:text-xs"
                autoFocus
              />
              <Button type="submit" size="sm" className="h-8 rounded-md px-2 text-[10px] md:h-9 md:rounded-lg md:px-3 md:text-xs">
                Start
              </Button>
            </form>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:left-3 md:h-4 md:w-4" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg pl-8 text-xs md:h-10 md:rounded-xl md:pl-9"
            />
          </div>
          <div className="flex gap-1.5 md:gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-[10px] font-semibold transition-colors md:px-4 md:py-1.5 md:text-xs',
                  filter === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1.5 pb-1.5 md:px-2 md:pb-2">
          {loading && filteredConversations.length === 0 && (
            <div className="space-y-2 p-1.5 md:space-y-3 md:p-2">
              <Skeleton className="h-14 w-full md:h-16" />
              <Skeleton className="h-14 w-full md:h-16" />
              <Skeleton className="h-14 w-full md:h-16" />
            </div>
          )}
          {filteredConversations.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground md:p-6">
              <MessageSquare className="mb-2 h-8 w-8 opacity-50 md:mb-3 md:h-10 md:w-10" />
              <p className="text-xs font-medium md:text-sm">No conversations yet</p>
              <p className="mb-2.5 max-w-[200px] text-[10px] md:mb-4 md:text-xs">
                Messages are fetched in real time. Start a conversation or check back once messages arrive.
              </p>
              {error && <p className="mb-2.5 max-w-[220px] text-[10px] text-destructive md:mb-3 md:text-xs">{error}</p>}
              <Button
                variant="outline"
                size="sm"
                className="rounded-md text-[10px] md:rounded-lg md:text-xs"
                onClick={() => setComposeOpen(true)}
              >
                <PenSquare className="mr-1.5 h-3 w-3 md:mr-2 md:h-3.5 md:w-3.5" />
                New conversation
              </Button>
            </div>
          )}
          <div className="space-y-0.5 md:space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = activeId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl p-2 text-left transition-all md:gap-3 md:rounded-2xl md:p-3',
                    isActive ? 'border border-primary/10 bg-white shadow-sm' : 'hover:bg-primary/5'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 bg-primary text-primary-foreground md:h-12 md:w-12">
                      <AvatarFallback className="text-xs md:text-sm">{getInitials(conv.contactName || conv.contact)}</AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 md:h-3.5 md:w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={cn('truncate text-sm font-semibold md:text-base', isActive && 'text-primary')}>
                        {conv.contactName || conv.contact}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {conv.lastMessage && formatRelative(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground md:text-xs">
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
      <section className={cn('flex h-full flex-1 flex-col bg-card', !mobileChatOpen && 'hidden md:flex')}>
        {activeConversation ? (
          <>
            <header className="flex h-14 items-center justify-between border-b border-border/10 px-2.5 md:h-16 md:px-4">
              <div className="flex items-center gap-2 md:gap-3">
                <Button variant="ghost" size="icon" className="-ml-1 h-8 w-8 md:-ml-2 md:h-9 md:w-9" onClick={() => setMobileChatOpen(false)}>
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Avatar className="h-9 w-9 bg-primary text-primary-foreground md:h-10 md:w-10">
                  <AvatarFallback className="text-xs md:text-sm">
                    {getInitials(activeConversation.contactName || activeConversation.contact)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold leading-none md:text-base">
                    {activeConversation.contactName || activeConversation.contact}
                  </h2>
                  <p className="text-[10px] font-medium text-emerald-500 md:text-[11px]">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md md:h-9 md:w-9 md:rounded-lg">
                  <Phone className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md md:h-9 md:w-9 md:rounded-lg">
                  <VideoIcon className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md md:h-9 md:w-9 md:rounded-lg">
                  <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </header>

            <div className="flex-1 space-y-2.5 overflow-y-auto bg-muted/30 p-2.5 md:space-y-4 md:p-4">
              <div className="flex justify-center">
                <span className="rounded-full bg-muted px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:px-4 md:py-1">
                  Today
                </span>
              </div>
              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex max-w-[90%] md:max-w-[85%]',
                    msg.direction === 'outbound' ? 'ml-auto justify-end' : 'justify-start'
                  )}
                >
                  {msg.direction === 'inbound' && (
                    <Avatar className="mr-1.5 h-7 w-7 bg-primary text-primary-foreground md:mr-2 md:h-8 md:w-8">
                      <AvatarFallback className="text-[10px] md:text-xs">
                        {getInitials(activeConversation.contactName || activeConversation.contact)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-0.5 md:space-y-1">
                    <div
                      className={cn(
                        'relative rounded-xl p-2 text-xs group md:rounded-2xl md:p-3 md:text-sm',
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
                      {msg.direction === 'outbound' && (
                        <span className="flex items-center gap-0.5">
                          {msg.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <footer className="border-t border-border/10 bg-card p-2.5 md:p-4">
              {error && (
                <div className="mb-1.5 flex items-center gap-1.5 text-xs text-destructive md:mb-2 md:gap-2 md:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {error}
                </div>
              )}
              {mediaUploads.length > 0 && (
                <div className="mb-1.5 flex flex-wrap gap-1.5 md:mb-2 md:gap-2">
                  {mediaUploads.map((upload) => (
                    <div key={upload.id} className="relative rounded-md border p-1.5 md:p-2">
                      {upload.type === 'image' ? (
                        <img src={upload.previewUrl} alt="preview" className="h-12 w-12 rounded object-cover md:h-16 md:w-16" />
                      ) : upload.type === 'video' ? (
                        <video src={upload.previewUrl} className="h-12 w-12 rounded object-cover md:h-16 md:w-16" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted md:h-16 md:w-16">
                          <FileAudio className="h-5 w-5 md:h-6 md:w-6" />
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
              <form onSubmit={handleSubmit} className="flex items-end gap-1.5 md:gap-2">
                <div className="flex items-center gap-0.5 pb-1 md:gap-1">
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
                    className="h-8 w-8 rounded-full md:h-9 md:w-9"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full md:h-9 md:w-9"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="To"
                    className="mb-1.5 h-7 rounded-md px-2 text-[10px] md:mb-2 md:h-8 md:rounded-lg md:px-3 md:text-xs"
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
                    className="w-full resize-none rounded-xl border border-border bg-muted px-3 py-2 pr-8 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:rounded-2xl md:px-4 md:py-3 md:pr-10 md:text-sm"
                  />
                  <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-primary md:bottom-2.5 md:right-3">
                    <Smile className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-lg md:h-11 md:w-11 md:rounded-xl"
                  disabled={sending || !to.trim() || !telnyxNumber || (mediaUploads.length === 0 && !body.trim())}
                >
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-card p-4 text-center text-muted-foreground md:p-6">
            <MessageSquare className="mb-2 h-10 w-10 opacity-50 md:mb-3 md:h-12 md:w-12" />
            <p className="text-sm font-medium md:text-base">Select a conversation</p>
            <p className="text-xs md:text-sm">Choose a contact from the sidebar to start chatting.</p>
          </div>
        )}
      </section>

        </div>
      )}
    </div>
  );
}

export default memo(Messages);
