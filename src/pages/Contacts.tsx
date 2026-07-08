import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, MessageSquare, UserPlus, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAppStore } from '../store/appStore';

const initialContacts = [
  { id: '1', name: 'Alice Johnson', number: '+15551234567', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', number: '+15552345678', email: 'bob@example.com' },
  { id: '3', name: 'Carol White', number: '+15553456789', email: 'carol@example.com' },
  { id: '4', name: 'David Lee', number: '+15554567890', email: 'david@example.com' },
  { id: '5', name: 'Eva Martinez', number: '+15555678901', email: 'eva@example.com' },
];

export function Contacts() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const conversations = useAppStore((s) => s.conversations);

  const contacts = initialContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.number.includes(query) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleStartChat = (number: string) => {
    const existing = conversations.find((c) => c.contact === number);
    if (existing) {
      setActiveConversation(existing.id);
    } else {
      setActiveConversation(number);
    }
    navigate('/messages');
  };

  const handleCall = () => {
    navigate('/calls');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your calling and messaging contacts.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>{contacts.length} contacts found</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {contacts.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p className="font-medium">No contacts found</p>
              <p className="text-xs">Try a different search term.</p>
            </div>
          )}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                  <AvatarFallback>{contact.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.number}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleCall()}
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleStartChat(contact.number)}
                  aria-label={`Message ${contact.name}`}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleStartChat(contact.number)}
                >
                  Start Chat
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(Contacts);
