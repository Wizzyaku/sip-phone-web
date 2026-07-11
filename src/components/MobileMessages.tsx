import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  MessageSquare,
  Globe,
  PenSquare,
  ArrowLeft,
  Phone,
  MoreVertical,
  PlusCircle,
  Send,
  X,
  UserPlus,
  ChevronDown,
  Check,
  CheckCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { cn } from '../lib/utils';
import { useAppStore, type Conversation, type Message, type MessageType, type MediaUpload } from '../store/appStore';

type MobileFilterTab = 'all' | 'sms' | 'webchat';

interface MobileMessagesProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  telnyxNumber: string | null;
  to: string;
  body: string;
  sending: boolean;
  search: string;
  mobileFilter: MobileFilterTab;
  composeNumber: string;
  composeOpen: boolean;
  mediaUploads: MediaUpload[];
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setSearch: (value: string) => void;
  setMobileFilter: (value: MobileFilterTab) => void;
  setComposeOpen: (open: boolean) => void;
  setComposeNumber: (value: string) => void;
  setBody: (value: string) => void;
  setTo: (value: string) => void;
  handleSelectConversation: (id: string) => void;
  handleStartConversation: (e: React.FormEvent) => void;
  sendTextMessage: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => void;
  handleRemoveMedia: (id: string) => void;
  fetchMessages: () => Promise<void>;
}

function getInitials(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(-2).toUpperCase() || '??';
}

function isSmsContact(contact: string) {
  return /^\+?\d/.test(contact.replace(/[\s()\-]/g, ''));
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

function ChatBubble({ msg }: { msg: Message }) {
  const isSent = msg.direction === 'outbound';
  return (
    <div className={cn('flex w-full min-w-0', isSent ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] min-w-0 space-y-1 overflow-hidden rounded-2xl p-3 shadow-sm',
          isSent ? 'rounded-tr-none bg-primary text-primary-foreground' : 'rounded-tl-none border bg-white text-foreground'
        )}
      >
        <p className="text-[13px] leading-snug break-words">{msg.body}</p>
        <div className={cn('flex items-center gap-1', isSent ? 'justify-end' : 'justify-start')}>
          <span className={cn('text-[9px] font-medium', isSent ? 'text-white/70' : 'text-muted-foreground')}>
            {formatTime(msg.createdAt)}
          </span>
          {isSent && (
            <span className="flex items-center gap-0.5">
              {msg.status === 'read' ? (
                <CheckCheck className="h-3 w-3 text-white/80" />
              ) : msg.status === 'delivered' ? (
                <CheckCheck className="h-3 w-3 text-white/60" />
              ) : (
                <Check className="h-3 w-3 text-white/60" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileMessages(props: MobileMessagesProps) {
  const user = useAppStore((s) => s.user);
  const [chatOpen, setChatOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTimer = useRef<number | null>(null);

  useEffect(() => {
    setChatOpen(!!props.activeConversation);
  }, [props.activeConversation]);

  useEffect(() => {
    if (drawerTimer.current) window.clearTimeout(drawerTimer.current);
    if (props.composeOpen) {
      drawerTimer.current = window.setTimeout(() => setDrawerOpen(true), 10);
    } else {
      setDrawerOpen(false);
    }
    return () => {
      if (drawerTimer.current) window.clearTimeout(drawerTimer.current);
    };
  }, [props.composeOpen]);

  const filteredConversations = useMemo(() => {
    let list = props.conversations;
    if (props.mobileFilter === 'sms') list = list.filter((c) => isSmsContact(c.contact));
    if (props.mobileFilter === 'webchat') list = list.filter((c) => !isSmsContact(c.contact));
    const query = props.search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.contact.toLowerCase().includes(query) ||
        c.contactName?.toLowerCase().includes(query) ||
        c.lastMessage?.body.toLowerCase().includes(query)
    );
  }, [props.conversations, props.mobileFilter, props.search]);

  const unreadCount = useMemo(
    () => props.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [props.conversations]
  );

  const handleOpenChat = (id: string) => {
    props.handleSelectConversation(id);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    props.setTo('');
  };

  const filterTabs: { id: MobileFilterTab; label: string; icon?: typeof MessageSquare }[] = [
    { id: 'all', label: 'All Messages' },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'webchat', label: 'Web Chat', icon: Globe },
  ];

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">
      {/* Inbox view */}
      <div
        className={cn(
          'flex h-full w-full min-w-0 flex-col transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          chatOpen && '-translate-x-1/4 opacity-50'
        )}
      >
        {/* Sub header */}
        <header className="flex items-center justify-between border-b border-border/20 bg-background/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20 bg-muted text-primary shadow-sm">
              <AvatarFallback className="font-bold text-lg">{getInitials(user.name || user.email || 'User')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold leading-none text-foreground">Messages</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {unreadCount} Unread
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={props.fetchMessages} disabled={props.loading}>
              <RefreshCw className={cn('h-4 w-4 text-muted-foreground', props.loading && 'animate-spin')} />
            </Button>
          </div>
        </header>

        {/* Search */}
        <div className="shrink-0 border-b border-border/10 bg-background/90 px-4 py-2.5 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={props.search}
              onChange={(e) => props.setSearch(e.target.value)}
              placeholder="Search messages"
              className="h-10 w-full rounded-full border border-border/40 bg-muted/60 pl-9 pr-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="shrink-0 border-b border-border/10 bg-background/90 px-4 py-3 backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {filterTabs.map((t) => {
              const Icon = t.icon;
              const active = props.mobileFilter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => props.setMobileFilter(t.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                      : 'border border-border/50 bg-white text-muted-foreground'
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat list */}
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-3 no-scrollbar">
          {props.loading && filteredConversations.length === 0 && (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
              ))}
            </div>
          )}

          {!props.loading && filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="mb-4 max-w-[200px] text-xs">Start a new conversation to send messages.</p>
              {props.error && <p className="max-w-[220px] text-xs text-destructive">{props.error}</p>}
            </div>
          )}

          <div className="flex min-w-0 max-w-full flex-col gap-2">
            {filteredConversations.map((conv) => {
              const unread = conv.unreadCount > 0;
              const sms = isSmsContact(conv.contact);
              const last = conv.lastMessage;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleOpenChat(conv.id)}
                  className={cn(
                    'flex w-full min-w-0 max-w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform active:scale-[0.98]',
                    unread
                      ? 'relative border border-primary/20 bg-white shadow-sm'
                      : 'glass-card'
                  )}
                >
                  <div className="relative h-12 w-12 shrink-0">
                    <Avatar className="h-12 w-12 bg-muted text-primary">
                      <AvatarFallback className="font-bold">
                        {getInitials(conv.contactName || conv.contact)}
                      </AvatarFallback>
                    </Avatar>
                    {!sms && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="mb-1 flex min-w-0 items-center justify-between">
                      <h4 className="min-w-0 flex-1 truncate pr-2 text-[13px] font-bold text-foreground">
                        {conv.contactName || conv.contact}
                      </h4>
                      <span className={cn('shrink-0 text-[10px] font-bold', unread ? 'text-primary' : 'text-muted-foreground')}>
                        {last ? formatRelative(last.createdAt) : ''}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-1">
                      <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground">
                        {last?.type === 'text' ? last.body : last ? `Sent ${last.type}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between gap-2 py-0.5">
                    {unread && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                    {sms ? (
                      <MessageSquare className="h-3 w-3 text-green-600" />
                    ) : (
                      <Globe className="h-3 w-3 text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {props.loading && filteredConversations.length > 0 && (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-5 w-5 animate-spin text-primary opacity-50" />
            </div>
          )}
        </div>

        {/* Floating new message button */}
        <button
          onClick={() => props.setComposeOpen(true)}
          className="absolute bottom-5 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(91,91,214,0.4)] transition-transform active:scale-90"
        >
          <PenSquare className="h-6 w-6" />
        </button>
      </div>

      {/* Chat view */}
      <div
        className={cn(
          'fixed inset-0 z-[55] flex min-w-0 flex-col overflow-hidden bg-background shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {props.activeConversation ? (
          <>
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/10 bg-background/95 px-2 shadow-sm backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-1">
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={handleCloseChat}>
                  <ArrowLeft className="h-5 w-5 text-primary" />
                </Button>
                <div className="flex min-w-0 cursor-pointer items-center gap-3 pl-1">
                  <Avatar className="h-9 w-9 bg-muted text-primary">
                    <AvatarFallback className="text-xs font-bold">
                      {getInitials(props.activeConversation.contactName || props.activeConversation.contact)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <h2 className="truncate text-[14px] font-bold leading-tight text-foreground">
                      {props.activeConversation.contactName || props.activeConversation.contact}
                    </h2>
                    <p className="truncate text-[10px] font-medium text-muted-foreground">
                      {isSmsContact(props.activeConversation.contact) ? 'SMS' : 'Web Chat'} • Online
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 px-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-4 no-scrollbar">
              <div className="flex justify-center shrink-0">
                <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground">Today</span>
              </div>
              {props.activeConversation.messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              <div ref={props.chatEndRef} />
            </div>

            <div className="shrink-0 border-t border-border/10 bg-background/95 px-3 pb-3 pt-2 backdrop-blur-md">
              {props.error && (
                <div className="mb-2 flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {props.error}
                </div>
              )}
              {props.mediaUploads.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {props.mediaUploads.map((upload) => (
                    <div key={upload.id} className="relative rounded-md border p-1.5">
                      {upload.type === 'image' ? (
                        <img src={upload.previewUrl} alt="preview" className="h-10 w-10 rounded object-cover" />
                      ) : upload.type === 'video' ? (
                        <video src={upload.previewUrl} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => props.handleRemoveMedia(upload.id)}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={props.handleSubmit} className="flex items-end gap-2">
                <input
                  ref={props.imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => props.handleFileSelect(e, 'image')}
                />
                <input
                  ref={props.videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => props.handleFileSelect(e, 'video')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => props.imageInputRef.current?.click()}
                >
                  <PlusCircle className="h-5 w-5 text-primary" />
                </Button>
                <div className="flex min-h-[40px] flex-1 items-center rounded-3xl border border-border/50 bg-muted px-3 shadow-inner">
                  <textarea
                    ref={props.textareaRef}
                    value={props.body}
                    onChange={(e) => {
                      props.setBody(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        props.handleSubmit(e);
                      }
                    }}
                    placeholder="Type an SMS..."
                    rows={1}
                    className="no-scrollbar w-full flex-1 resize-none bg-transparent py-2.5 text-[14px] leading-snug text-foreground placeholder:text-muted-foreground focus:outline-none"
                    style={{ maxHeight: '100px' }}
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-90"
                  disabled={
                    props.sending ||
                    !props.to.trim() ||
                    !props.telnyxNumber ||
                    (props.mediaUploads.length === 0 && !props.body.trim())
                  }
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : null}
      </div>

      {/* New message drawer */}
      {props.composeOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className={cn(
              'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
              drawerOpen ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => props.setComposeOpen(false)}
          />
          <div
            className={cn(
              'relative flex w-full flex-col rounded-t-[28px] bg-background pb-6 pt-2 shadow-[0_-15px_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              drawerOpen ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted" />
            <div className="flex items-center justify-between border-b border-border/20 px-4 pb-2 pt-2">
              <h2 className="text-[16px] font-bold text-foreground">New Message</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-muted"
                onClick={() => props.setComposeOpen(false)}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <form onSubmit={props.handleStartConversation} className="flex flex-col gap-4 px-4 py-4">
              <div className="flex items-center gap-3 border-b border-border/30 pb-2">
                <span className="w-10 text-sm font-bold text-muted-foreground">To:</span>
                <Input
                  type="text"
                  value={props.composeNumber}
                  onChange={(e) => props.setComposeNumber(e.target.value)}
                  placeholder="Type a name or phone number"
                  className="h-8 flex-1 border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0"
                />
                <button type="button" className="text-primary">
                  <UserPlus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex cursor-pointer items-center gap-3 border-b border-border/30 pb-2">
                <span className="w-10 text-sm font-bold text-muted-foreground">From:</span>
                <div className="flex flex-1 items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">SMS</span>
                  <span className="text-sm font-semibold text-foreground">{props.telnyxNumber || '+1 (555) 012-3456'}</span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="rounded-2xl border border-border/20 bg-white p-3 shadow-sm">
                <textarea
                  value={props.body}
                  onChange={(e) => props.setBody(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="no-scrollbar w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full gap-2 rounded-xl bg-primary text-primary-foreground text-[14px] font-bold shadow-[0_8px_20px_rgba(91,91,214,0.3)] transition-all active:scale-[0.98]"
              >
                <Send className="h-4 w-4" /> Send SMS
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
