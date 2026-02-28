import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGetAllUsers } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import StoryViewerModal from './StoryViewerModal';
import { UserProfile } from '../backend';

const NEON_RING_COLORS = [
  'var(--neon-cyan)',
  'var(--neon-violet)',
  'var(--neon-pink)',
  'var(--neon-green)',
  'var(--neon-yellow)',
];

function getRingColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NEON_RING_COLORS[Math.abs(hash) % NEON_RING_COLORS.length];
}

function getInitials(profile: UserProfile): string {
  const name = profile.displayName || profile.username;
  return name.slice(0, 2).toUpperCase();
}

export default function StoriesRow() {
  const { username: currentUsername } = useAuth();
  const { data: allUsers = [], isLoading } = useGetAllUsers();
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  const otherUsers = allUsers.filter((u) => u.username !== currentUsername);

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="w-12 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (otherUsers.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        No other users yet. Invite friends to join!
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
        {otherUsers.map((user) => {
          const ringColor = getRingColor(user.username);
          return (
            <button
              key={user.username}
              onClick={() => setViewingUser(user)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div
                className="w-14 h-14 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${ringColor}, var(--neon-violet))`,
                  boxShadow: `0 0 10px ${ringColor}60`,
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--card)', color: ringColor }}
                >
                  {getInitials(user)}
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors max-w-[56px] truncate">
                {user.displayName || user.username}
              </span>
            </button>
          );
        })}
      </div>

      {viewingUser && (
        <StoryViewerModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}
    </>
  );
}
