import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import {
  useGetContacts,
  useGetPendingContactRequests,
  useSendContactRequest,
  useAcceptContactRequest,
  useDeclineContactRequest,
  useFindUsersByUsername,
} from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserPlus, MessageSquare, Check, X, Users } from 'lucide-react';

export default function ContactsPage() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contacts = [], isLoading: contactsLoading } = useGetContacts(username);
  const { data: pendingRequests = [], isLoading: pendingLoading } = useGetPendingContactRequests(username);
  const { data: searchResults = [], isLoading: searchLoading } = useFindUsersByUsername(searchTerm);

  const sendRequest = useSendContactRequest();
  const acceptRequest = useAcceptContactRequest();
  const declineRequest = useDeclineContactRequest();

  const handleSendRequest = async (targetUser: string) => {
    if (!username) return;
    try {
      await sendRequest.mutateAsync({ sender: username, targetUser });
    } catch (err: any) {
      console.error('Failed to send request:', err.message);
    }
  };

  const handleAccept = async (requester: string) => {
    if (!username) return;
    try {
      await acceptRequest.mutateAsync({ username, requester });
    } catch (err: any) {
      console.error('Failed to accept request:', err.message);
    }
  };

  const handleDecline = async (requester: string) => {
    if (!username) return;
    try {
      await declineRequest.mutateAsync({ username, requester });
    } catch (err: any) {
      console.error('Failed to decline request:', err.message);
    }
  };

  const getInitials = (profile: UserProfile) =>
    profile.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const isContact = (targetUsername: string) =>
    contacts.some((c) => c.username === targetUsername);

  const hasPendingFrom = (targetUsername: string) =>
    pendingRequests.some((r) => r.username === targetUsername);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <span className="text-sm text-muted-foreground">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList className="w-full">
          <TabsTrigger value="contacts" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            My Contacts
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Find People
          </TabsTrigger>
        </TabsList>

        {/* My Contacts */}
        <TabsContent value="contacts" className="mt-4 space-y-3">
          {contactsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No contacts yet. Find people to connect with!</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.username}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {getInitials(contact)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{contact.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{contact.username}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: `/chat/${contact.username}` })}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        {/* Pending Requests */}
        <TabsContent value="requests" className="mt-4 space-y-3">
          {pendingLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No pending contact requests.</p>
            </div>
          ) : (
            pendingRequests.map((requester) => (
              <div
                key={requester.username}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {getInitials(requester)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{requester.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{requester.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(requester.username)}
                    disabled={acceptRequest.isPending}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(requester.username)}
                    disabled={declineRequest.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Search */}
        <TabsContent value="search" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : searchResults.length === 0 && searchTerm.trim() ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found for "{searchTerm}"</p>
            </div>
          ) : (
            searchResults
              .filter((u) => u.username !== username)
              .map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  {isContact(user.username) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate({ to: `/chat/${user.username}` })}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user.username)}
                      disabled={sendRequest.isPending || hasPendingFrom(user.username)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {hasPendingFrom(user.username) ? 'Pending' : 'Add'}
                    </Button>
                  )}
                </div>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
