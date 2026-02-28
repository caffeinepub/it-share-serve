import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  useGetCallerContacts,
  useGetPendingContactRequests,
  useFindUsersByUsername,
  useFindUserByProfileNumber,
  useSendContactRequest,
  useAcceptContactRequest,
  useDeclineContactRequest,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type UserProfile } from '../backend';
import { Search, UserPlus, Check, X, MessageCircle, Hash, AtSign, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AnimatedHeading from '../components/AnimatedHeading';
import { Principal } from '@dfinity/principal';

function UserCard({
  profile,
  principalId,
  actions,
}: {
  profile: UserProfile;
  principalId?: string;
  actions?: React.ReactNode;
}) {
  const avatarUrl = profile.profilePic?.getDirectURL() || profile.avatarUrl;

  return (
    <div className="card-dark rounded-xl p-4 flex items-center gap-3 border border-border hover:border-neon-violet/30 transition-all">
      <Avatar className="w-10 h-10 border border-neon-violet/20">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-secondary text-xs font-orbitron text-neon-violet">
          {profile.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{profile.displayName}</p>
        <p className="text-xs text-muted-foreground">@{profile.username} · #{String(profile.profileNumber).padStart(5, '0')}</p>
      </div>
      {actions}
    </div>
  );
}

export default function ContactsPage() {
  const { identity } = useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileNumberSearch, setProfileNumberSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'username' | 'number'>('username');

  const { data: contacts = [], isLoading: contactsLoading } = useGetCallerContacts();
  const { data: pendingRequests = [] } = useGetPendingContactRequests();
  const { data: searchResults = [], isLoading: searching } = useFindUsersByUsername(
    searchMode === 'username' ? searchQuery : ''
  );
  const profileNumBigInt = profileNumberSearch ? BigInt(profileNumberSearch) : undefined;
  const { data: profileNumberResult } = useFindUserByProfileNumber(
    searchMode === 'number' ? profileNumBigInt : undefined
  );

  const sendRequest = useSendContactRequest();
  const acceptRequest = useAcceptContactRequest();
  const declineRequest = useDeclineContactRequest();

  const myPrincipal = identity?.getPrincipal().toString();

  // We need principal IDs for contacts — we'll use username as key since backend returns UserProfile
  // The contacts list doesn't include principal IDs directly, so we use username for chat routing
  const handleSendRequest = async (profile: UserProfile) => {
    // We can't get principal from UserProfile directly, so we search and use the result
    // For now, show a message that we need to find the user first
    toast.info('To add a contact, search for them and use the Add button');
  };

  const handleAccept = async (profile: UserProfile) => {
    // We need the principal of the requester — stored in pendingRequests
    // Since we only have UserProfile, we'll try to find by username
    try {
      // The backend stores principals, but we only get UserProfile back
      // We'll need to search for the user to get their principal
      toast.loading('Accepting request...');
      // This is a limitation — we need principal IDs
      toast.dismiss();
      toast.error('Unable to accept: principal ID not available in profile data');
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (profile: UserProfile) => {
    try {
      toast.error('Unable to decline: principal ID not available in profile data');
    } catch (err) {
      toast.error('Failed to decline request');
    }
  };

  const displayResults = searchMode === 'username'
    ? searchResults
    : profileNumberResult
    ? [profileNumberResult]
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-neon-cyan" />
        <AnimatedHeading text="Contacts" variant="gradient" as="h1" className="text-2xl font-bold" />
        {pendingRequests.length > 0 && (
          <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink/30">
            {pendingRequests.length} pending
          </Badge>
        )}
      </div>

      <Tabs defaultValue="contacts">
        <TabsList className="bg-secondary/50 border border-border w-full">
          <TabsTrigger value="contacts" className="flex-1 data-[state=active]:bg-neon-violet/20 data-[state=active]:text-neon-violet">
            My Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
            Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
            Find People
          </TabsTrigger>
        </TabsList>

        {/* My Contacts */}
        <TabsContent value="contacts" className="mt-4 space-y-3">
          {contactsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-dark rounded-xl p-4 h-16 animate-pulse" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No contacts yet</p>
              <p className="text-sm mt-1">Search for people to add them</p>
            </div>
          ) : (
            contacts.map(contact => (
              <UserCard
                key={contact.username}
                profile={contact}
                actions={
                  <Link
                    to={`/chat/${contact.username}`}
                    className="btn-neon-violet rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                  </Link>
                }
              />
            ))
          )}
        </TabsContent>

        {/* Pending Requests */}
        <TabsContent value="requests" className="mt-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Check className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pending requests</p>
            </div>
          ) : (
            pendingRequests.map(profile => (
              <UserCard
                key={profile.username}
                profile={profile}
                actions={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(profile)}
                      className="w-8 h-8 rounded-lg bg-neon-green/20 border border-neon-green/30 flex items-center justify-center text-neon-green hover:bg-neon-green/30 transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDecline(profile)}
                      className="w-8 h-8 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center justify-center text-destructive hover:bg-destructive/30 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                }
              />
            ))
          )}
        </TabsContent>

        {/* Search */}
        <TabsContent value="search" className="mt-4 space-y-4">
          {/* Search Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('username')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                searchMode === 'username'
                  ? 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan'
                  : 'border-border text-muted-foreground hover:border-neon-cyan/30'
              }`}
            >
              <AtSign className="w-4 h-4" />
              By Username
            </button>
            <button
              onClick={() => setSearchMode('number')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                searchMode === 'number'
                  ? 'bg-neon-violet/20 border-neon-violet/40 text-neon-violet'
                  : 'border-border text-muted-foreground hover:border-neon-violet/30'
              }`}
            >
              <Hash className="w-4 h-4" />
              By Profile #
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {searchMode === 'username' ? (
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            ) : (
              <input
                type="number"
                value={profileNumberSearch}
                onChange={e => setProfileNumberSearch(e.target.value)}
                placeholder="Enter profile number..."
                className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                min="1"
              />
            )}
          </div>

          {/* Results */}
          <div className="space-y-3">
            {searching && (
              <div className="text-center py-4 text-muted-foreground text-sm">Searching...</div>
            )}
            {displayResults.map(profile => {
              const isContact = contacts.some(c => c.username === profile.username);
              const isMe = profile.username === (contacts.find(c => c.username === profile.username)?.username);

              return (
                <UserCard
                  key={profile.username}
                  profile={profile}
                  actions={
                    isContact ? (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                        Contact
                      </Badge>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(profile)}
                        className="btn-neon-violet rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    )
                  }
                />
              );
            })}
            {!searching && displayResults.length === 0 && (searchQuery || profileNumberSearch) && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
