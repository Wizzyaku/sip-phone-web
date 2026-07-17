import { useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Phone,
  MessageSquare,
  UserPlus,
  Upload,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { AddContactModal } from '../components/AddContactModal';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

interface ContactTag {
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'success' | 'outline';
}

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  number: string;
  phoneType: string;
  tags: ContactTag[];
  initials: string;
  avatarColor: string;
}

const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Elena Rodriguez',
    email: 'elena.r@techflow.io',
    company: 'TechFlow Systems',
    number: '+1 (555) 012-3456',
    phoneType: 'Mobile',
    tags: [
      { label: 'Enterprise', variant: 'primary' },
      { label: 'VIP', variant: 'tertiary' },
    ],
    initials: 'ER',
    avatarColor: 'bg-primary/10 text-primary',
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    email: 'm.thorne@glocapital.com',
    company: 'Global Capital Partners',
    number: '+44 20 7946 0123',
    phoneType: 'Office',
    tags: [{ label: 'Investor', variant: 'secondary' }],
    initials: 'MT',
    avatarColor: 'bg-secondary/10 text-secondary',
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    email: 'sarah.j@pixelperfect.design',
    company: 'PixelPerfect Design',
    number: '+1 (555) 987-6543',
    phoneType: 'Personal',
    tags: [
      { label: 'Active Lead', variant: 'success' },
      { label: 'Design', variant: 'primary' },
    ],
    initials: 'SJ',
    avatarColor: 'bg-green-500/10 text-green-600',
  },
  {
    id: '4',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    company: 'Acme Corp',
    number: '+1 (555) 123-4567',
    phoneType: 'Mobile',
    tags: [{ label: 'Customer', variant: 'primary' }],
    initials: 'AJ',
    avatarColor: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: '5',
    name: 'Bob Smith',
    email: 'bob@example.com',
    company: 'Smith Logistics',
    number: '+1 (555) 234-5678',
    phoneType: 'Office',
    tags: [{ label: 'Vendor', variant: 'outline' }],
    initials: 'BS',
    avatarColor: 'bg-orange-500/10 text-orange-600',
  },
  {
    id: '6',
    name: 'Carol White',
    email: 'carol@example.com',
    company: 'White & Co',
    number: '+1 (555) 345-6789',
    phoneType: 'Mobile',
    tags: [
      { label: 'Partner', variant: 'secondary' },
      { label: 'VIP', variant: 'tertiary' },
    ],
    initials: 'CW',
    avatarColor: 'bg-purple-500/10 text-purple-600',
  },
  {
    id: '7',
    name: 'David Lee',
    email: 'david@example.com',
    company: 'NextGen Labs',
    number: '+1 (555) 456-7890',
    phoneType: 'Office',
    tags: [{ label: 'Lead', variant: 'success' }],
    initials: 'DL',
    avatarColor: 'bg-teal-500/10 text-teal-600',
  },
  {
    id: '8',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    company: 'Martinez Consulting',
    number: '+1 (555) 567-8901',
    phoneType: 'Personal',
    tags: [{ label: 'Enterprise', variant: 'primary' }],
    initials: 'EM',
    avatarColor: 'bg-pink-500/10 text-pink-600',
  },
];

const PAGE_SIZE = 8;

const tagStyles = {
  primary: 'bg-primary/10 text-primary border-primary/10',
  secondary: 'bg-secondary/10 text-secondary border-secondary/10',
  tertiary: 'bg-amber-500/10 text-amber-600 border-amber-500/10',
  success: 'bg-green-500/10 text-green-600 border-green-500/10',
  outline: 'bg-muted text-muted-foreground border-border',
};

export function Contacts() {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const conversations = useAppStore((s) => s.conversations);

  const filtered = useMemo(() => {
    return initialContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.number.includes(query) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.company.toLowerCase().includes(query.toLowerCase()) ||
        c.tags.some((t) => t.label.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const contacts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleStartChat = (number: string) => {
    const existing = conversations.find((c) => c.contact === number);
    if (existing) {
      setActiveConversation(existing.id);
    } else {
      setActiveConversation(number);
    }
    navigate('/messages');
  };

  const handleCall = (number: string) => {
    navigate('/calls', { state: { dialNumber: number } });
  };

  const isEmpty = filtered.length === 0;

  return (
    <div className="space-y-4 md:space-y-6 md:pb-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
        <div>
          <h2 className="hidden md:block text-3xl font-bold tracking-tight text-foreground">Contacts</h2>
          <p className="hidden md:block text-sm text-muted-foreground">Manage your organization's relationships and communication history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex rounded-xl">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button size="sm" className="hidden md:flex rounded-xl px-4 py-2 text-sm" onClick={() => setAddModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search Bar & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="rounded-lg md:rounded-xl border-border bg-card pl-9 md:pl-10 h-8 md:h-10 text-xs md:text-sm placeholder:text-muted-foreground shadow-sm"
          />
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto">
          <span className="text-lg md:text-sm font-black text-foreground tracking-tight">{filtered.length} <span className="text-muted-foreground font-bold">contacts</span></span>
          <Button size="sm" className="md:hidden rounded-lg h-8 px-3 text-xs font-bold shadow-sm" onClick={() => setAddModalOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
          <div className="hidden md:flex gap-1 rounded-lg bg-muted p-1 ml-4">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-2 transition-all',
                viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-2 transition-all',
                viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-24 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-10 w-10 text-primary opacity-60" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No Contacts Found</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            We couldn't find any contacts matching your search. Try adjusting your terms or add your first contact.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => setQuery('')} variant="outline">
              Reset Filters
            </Button>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Contact
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={cn("hidden md:block", viewMode === 'grid' && "md:hidden")}>
            <Card className="glass-card overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-primary/5">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Numbers</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="group transition-colors hover:bg-white/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className={cn('h-10 w-10 border border-white/50', contact.avatarColor)}>
                              <AvatarFallback className="text-sm font-semibold">{contact.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{contact.name}</div>
                              <div className="text-xs text-muted-foreground">{contact.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-muted-foreground">{contact.company}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                              <Phone className="h-4 w-4" />
                              <span>{contact.number}</span>
                            </div>
                            <span className="ml-6 text-xs text-muted-foreground">{contact.phoneType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {contact.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className={cn('rounded-full text-[10px] font-semibold', tagStyles[tag.variant])}>
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => handleCall(contact.number)}
                              aria-label={`Call ${contact.name}`}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => handleStartChat(contact.number)}
                              aria-label={`Message ${contact.name}`}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between border-t border-white/20 bg-white/30 px-6 py-4">
                <span className="text-sm text-muted-foreground">
                  Showing {contacts.length} of {filtered.length} contacts
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className={cn('h-8 w-8 px-0', p === currentPage && 'bg-primary text-primary-foreground')}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Mobile Compact List */}
          <div className="md:hidden flex flex-col gap-2.5">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md"
              >
                <Avatar className={cn('h-11 w-11 shrink-0', contact.avatarColor)}>
                  <AvatarFallback className="text-sm font-bold">{contact.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-sm font-bold text-foreground">{contact.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{contact.phoneType}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{contact.company}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {contact.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold border', tagStyles[tag.variant])}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleCall(contact.number)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                    aria-label={`Call ${contact.name}`}
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleStartChat(contact.number)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                    aria-label={`Message ${contact.name}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Grid View */}
          <div className={cn("hidden md:grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3", viewMode === 'list' && "md:hidden")}>
            {contacts.map((contact) => (
              <Card key={contact.id} className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 md:gap-4">
                  <Avatar className={cn('h-10 w-10 md:h-12 md:w-12 border border-white/50 shrink-0', contact.avatarColor)}>
                    <AvatarFallback className="text-xs md:text-sm font-semibold">{contact.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate pr-2">
                        <div className="font-bold text-sm md:text-base text-foreground truncate">{contact.name}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground truncate">{contact.company}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mt-1 -mr-1">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs md:text-sm text-primary bg-primary/5 w-max px-2 py-1 rounded-md">
                      <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                      <span className="font-semibold">{contact.number}</span>
                    </div>
                    
                    <div className="mt-2.5 flex flex-wrap gap-1 md:gap-1.5">
                      {contact.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className={cn('rounded-[4px] px-1.5 md:px-2 py-0 md:py-0.5 text-[9px] md:text-[10px] font-semibold', tagStyles[tag.variant])}>
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-3.5 flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 md:h-8 flex-1 text-[10px] md:text-xs gap-1.5" onClick={() => handleCall(contact.number)}>
                        <Phone className="h-3 w-3" /> Call
                      </Button>
                      <Button size="sm" className="h-7 md:h-8 flex-1 text-[10px] md:text-xs gap-1.5" onClick={() => handleStartChat(contact.number)}>
                        <MessageSquare className="h-3 w-3" /> SMS
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      <AddContactModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}

export default memo(Contacts);
