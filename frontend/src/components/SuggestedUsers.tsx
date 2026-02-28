import React from 'react';
import { UserPlus, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGetAllUsers, useGetContacts, useSendContactRequest } from '../hooks/useQueries';

export default function SuggestedUsers() {
  const { username } = useAuth();
  const { data: allUsers = [] } = useGetAllUsers();
  const { data: contacts = [] } = useGetContacts(username || '');
  const sendRequest = useSendContactRequest();

  const contactUsernames = new Set(contacts.map((c) => c.username));
  const suggestions = allUsers
    .filter((u) => u.username !== username && !contactUsernames.has(u.username))
    .slice(0, 5);

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested</h3>
      <div className="space-y-2">
        {suggestions.map((user) => {
          const isSent = sendRequest.variables?.targetUser === user.username && sendRequest.isPending;
          const isSuccess = sendRequest.isSuccess && sendRequest.variables?.targetUser === user.username;

          return (
            <div
              key={user.username}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-border/60 transition-all duration-200"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--neon-cyan)30'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))', color: 'var(--background)' }}
              >
                {user.displayName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm truncate">{user.displayName}</div>
                <div className="text-muted-foreground text-xs truncate">@{user.username}</div>
              </div>
              <button
                onClick={() => sendRequest.mutate({ sender: username || '', targetUser: user.username })}
                disabled={isSent || isSuccess}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-70 shrink-0"
                style={
                  isSuccess
                    ? { background: 'var(--neon-green)20', color: 'var(--neon-green)', border: '1px solid var(--neon-green)40' }
                    : { background: 'linear-gradient(135deg, var(--neon-cyan)20, var(--neon-violet)20)', color: 'var(--neon-cyan)', border: '1px solid var(--neon-cyan)40' }
                }
              >
                {isSuccess ? <><Check size={12} /> Sent</> : <><UserPlus size={12} /> Add</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
