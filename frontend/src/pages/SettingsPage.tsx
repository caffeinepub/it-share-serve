import React from 'react';
import { Settings, Bell, Play, Moon, Info, LogOut } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import AnimatedHeading from '../components/AnimatedHeading';

export default function SettingsPage() {
  const { logout, username } = useAuth();
  const { settings, toggleSetting } = useSettings();

  const settingItems = [
    {
      id: 'darkMode' as const,
      icon: Moon,
      label: 'Dark Mode',
      description: 'Use dark theme across the app',
      color: 'var(--neon-violet)',
    },
    {
      id: 'notifications' as const,
      icon: Bell,
      label: 'Notifications',
      description: 'Receive push notifications',
      color: 'var(--neon-cyan)',
    },
    {
      id: 'autoplayVideos' as const,
      icon: Play,
      label: 'Autoplay Videos',
      description: 'Automatically play videos in feed',
      color: 'var(--neon-pink)',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/50">
        <AnimatedHeading
          text="Settings"
          variant="shimmer"
          className="text-2xl font-orbitron font-bold mb-1"
        />
        <p className="text-muted-foreground text-sm">Manage your preferences</p>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl">
        {/* Account Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</h2>
          <div
            className="bg-card/50 border border-border/30 rounded-2xl p-4 flex items-center gap-3"
            style={{ borderColor: 'var(--neon-cyan)20' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))', color: 'var(--background)' }}
            >
              {username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-semibold text-foreground">{username}</div>
              <div className="text-muted-foreground text-xs">Logged in</div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preferences</h2>
          <div className="bg-card/50 border border-border/30 rounded-2xl overflow-hidden" style={{ borderColor: 'var(--neon-violet)20' }}>
            {settingItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-4 ${index < settingItems.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{item.label}</div>
                    <div className="text-muted-foreground text-xs">{item.description}</div>
                  </div>
                  <Switch
                    checked={settings[item.id]}
                    onCheckedChange={() => toggleSetting(item.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h2>
          <div
            className="bg-card/50 border border-border/30 rounded-2xl p-4"
            style={{ borderColor: 'var(--neon-pink)20' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--neon-pink)15', border: '1px solid var(--neon-pink)30' }}
              >
                <Info size={18} style={{ color: 'var(--neon-pink)' }} />
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">ShareServe</div>
                <div className="text-muted-foreground text-xs">Version 1.0.0</div>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              A decentralized social media platform built on the Internet Computer. Share photos, videos, and connect with friends.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-200 border"
            style={{
              borderColor: 'var(--destructive)40',
              color: 'var(--destructive)',
              background: 'var(--destructive)10',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--destructive)20'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--destructive)10'; }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
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
        </div>
      </div>
    </div>
  );
}
