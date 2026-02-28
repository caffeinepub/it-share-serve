import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../backend';

interface StoryViewerModalProps {
  user: UserProfile;
  onClose: () => void;
}

export default function StoryViewerModal({ user, onClose }: StoryViewerModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--neon-cyan)15, var(--neon-violet)15, var(--neon-pink)15)',
          border: '1px solid var(--neon-cyan)40',
          boxShadow: '0 0 40px var(--neon-cyan)20',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-border/30 z-10">
          <div
            className="h-full animate-story-progress"
            style={{ background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-violet))' }}
            onAnimationEnd={onClose}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-background/50 backdrop-blur-sm text-foreground hover:text-primary transition-colors"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="p-8 pt-10 flex flex-col items-center text-center min-h-[400px] justify-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
              color: 'var(--background)',
              boxShadow: '0 0 20px var(--neon-cyan)',
            }}
          >
            {(user.displayName || user.username).slice(0, 2).toUpperCase()}
          </div>
          <h3 className="font-orbitron font-bold text-xl text-foreground mb-1">{user.displayName}</h3>
          <p className="text-muted-foreground text-sm mb-6">@{user.username}</p>
          <div
            className="w-full rounded-2xl p-4 text-sm text-foreground/80"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {user.bio || 'No bio yet. Check out their profile!'}
          </div>
        </div>
      </div>
    </div>
  );
}
