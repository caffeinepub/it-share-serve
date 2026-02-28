import React, { useState } from 'react';
import { UserCheck, UserPlus, Clock, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  useGetContacts,
  useGetPendingContactRequests,
  useAcceptContactRequest,
  useDeclineContactRequest,
  useFindUsersByUsername,
  useSendContactRequest,
} from '../hooks/useQueries';
import SuggestedUsers from '../components/SuggestedUsers';

type Tab = 'contacts' | 'requests' | 'find';

export default function ContactsPage() {
  const { username } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contacts = [] } = useGetContacts(username || '');
  const { data: pendingRequests = [] } = useGetPendingContactRequests(username || '');
  const acceptRequest = useAcceptContactRequest();
  const declineRequest = useDeclineContactRequest();
  const { data: searchResults = [] } = useFindUsersByUsername(searchQuery);
  const sendRequest = useSendContactRequest();

  const tabs = [
    { id: 'contacts' as Tab, label: 'My Contacts', icon: UserCheck, count: contacts.length },
    { id: 'requests' as Tab, label: 'Requests', icon: Clock, count: pendingRequests.length },
    { id: 'find' as Tab, label: 'Find People', icon: UserPlus, count: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/50">
        <h1 className="font-orbitron font-bold text-2xl gradient-neon-text mb-1">Contacts</h1>
        <p className="text-muted-foreground text-sm">Manage your connections</p>
      </div>

      {/* Suggested Users */}
      <div className="px-4 pt-4">
        <SuggestedUsers />
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-secondary/30 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={isActive ? { borderBottom: '2px solid var(--neon-cyan)', color: 'var(--neon-cyan)' } : {}}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                    style={{ background: 'var(--neon-pink)', color: 'var(--background)' }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'contacts' && (
          <div>
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--neon-cyan)15', border: '1px solid var(--neon-cyan)30' }}
                >
                  <Users size={28} style={{ color: 'var(--neon-cyan)' }} />
                </div>
                <p className="text-muted-foreground text-sm">No contacts yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Find people to connect with</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.username}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-border/60 transition-all duration-200"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))', color: 'var(--background)' }}
                    >
                      {contact.displayName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">{contact.displayName}</div>
                      <div className="text-muted-foreground text-xs">@{contact.username}</div>
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'var(--neon-green)15', color: 'var(--neon-green)', border: '1px solid var(--neon-green)30' }}
                    >
                      Connected
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--neon-violet)15', border: '1px solid var(--neon-violet)30' }}
                >
                  <Clock size={28} style={{ color: 'var(--neon-violet)' }} />
                </div>
                <p className="text-muted-foreground text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((requester) => (
                  <div
                    key={requester.username}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30"
                    style={{ borderColor: 'var(--neon-violet)30' }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-pink))', color: 'var(--background)' }}
                    >
                      {requester.displayName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">{requester.displayName}</div>
                      <div className="text-muted-foreground text-xs">@{requester.username}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest.mutate({ username: username || '', requester: requester.username })}
                        disabled={acceptRequest.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                        style={{ background: 'var(--neon-green)', color: 'var(--background)' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineRequest.mutate({ username: username || '', requester: requester.username })}
                        disabled={declineRequest.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 bg-secondary/50 text-muted-foreground hover:text-foreground"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'find' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
            </div>
            {searchQuery.trim() && (
              <div className="space-y-2">
                {searchResults.filter(u => u.username !== username).map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-border/60 transition-all duration-200"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink))', color: 'var(--background)' }}
                    >
                      {user.displayName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">{user.displayName}</div>
                      <div className="text-muted-foreground text-xs">@{user.username}</div>
                    </div>
                    <button
                      onClick={() => sendRequest.mutate({ sender: username || '', targetUser: user.username })}
                      disabled={sendRequest.isPending}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))', color: 'var(--background)' }}
                    >
                      Add
                    </button>
                  </div>
                ))}
                {searchResults.filter(u => u.username !== username).length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">No users found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
