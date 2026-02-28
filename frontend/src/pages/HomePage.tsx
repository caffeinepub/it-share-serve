import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PlusSquare, Search, MessageCircle, Users, Zap, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import StoriesRow from '../components/StoriesRow';
import TrendingTopics from '../components/TrendingTopics';
import AnimatedHeading from '../components/AnimatedHeading';
import SuggestedUsers from '../components/SuggestedUsers';

const quickActions = [
  { icon: PlusSquare, label: 'Create', description: 'Share photos & videos', path: '/create', color: 'var(--neon-cyan)' },
  { icon: Search, label: 'Discover', description: 'Find new content', path: '/search', color: 'var(--neon-violet)' },
  { icon: MessageCircle, label: 'Chat', description: 'Message friends', path: '/chat', color: 'var(--neon-pink)' },
  { icon: Users, label: 'Contacts', description: 'Manage connections', path: '/contacts', color: 'var(--neon-green)' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { username } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/app-bg.dim_1920x1080.png)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }} />
        <div className="relative z-10 px-6 pt-8 pb-6">
          <AnimatedHeading
            text={`Welcome back, ${username || 'friend'}!`}
            variant="shimmer"
            className="text-2xl md:text-3xl font-orbitron font-bold mb-2"
          />
          <p className="text-muted-foreground text-sm">What are you creating today?</p>
        </div>
      </div>

      {/* Stories Row */}
      <div className="px-4 mb-6">
        <StoriesRow />
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap size={14} style={{ color: 'var(--neon-yellow)' }} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate({ to: action.path })}
                className="bg-card/60 border border-border/50 rounded-2xl p-4 text-left hover:scale-[1.02] transition-all duration-200 group"
                style={{ '--hover-color': action.color } as React.CSSProperties}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = action.color;
                  el.style.boxShadow = `0 0 15px ${action.color}40`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = '';
                  el.style.boxShadow = '';
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${action.color}20`, border: `1px solid ${action.color}40` }}
                >
                  <Icon size={20} style={{ color: action.color }} />
                </div>
                <div className="font-semibold text-foreground text-sm">{action.label}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{action.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="px-4 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={14} style={{ color: 'var(--neon-pink)' }} />
          Trending
        </h2>
        <TrendingTopics />
      </div>

      {/* Suggested Users */}
      <div className="px-4 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Star size={14} style={{ color: 'var(--neon-yellow)' }} />
          Suggested People
        </h2>
        <SuggestedUsers />
      </div>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-border/30 text-center">
        <p className="text-muted-foreground text-xs">
          Built with <span style={{ color: 'var(--neon-pink)' }}>♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--neon-cyan)' }}
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-muted-foreground/50 text-xs mt-1">© {new Date().getFullYear()} ShareServe</p>
      </footer>
    </div>
  );
}
