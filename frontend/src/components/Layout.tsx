import { ReactNode } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Users, MessageCircle, Sparkles, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/create', label: 'Create', icon: Sparkles },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Layout({ children }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const getAvatarUrl = () => {
    if (userProfile?.profilePic) return userProfile.profilePic.getDirectURL();
    if (userProfile?.avatarUrl) return userProfile.avatarUrl;
    return '';
  };

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName.slice(0, 2).toUpperCase();
    }
    return 'SS';
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neon-violet/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/assets/generated/shareserve-logo.dim_256x256.png" alt="ShareServe" className="w-8 h-8" />
            <span className="font-orbitron font-bold text-lg gradient-text hidden sm:block">SHARESERVE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-neon-violet/10 text-neon-violet text-glow-violet border border-neon-violet/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {userProfile && (
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="w-8 h-8 border border-neon-violet/30">
                  <AvatarImage src={getAvatarUrl()} />
                  <AvatarFallback className="bg-secondary text-xs font-orbitron text-neon-violet">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-xs font-medium text-foreground">{userProfile.displayName}</p>
                  <p className="text-xs text-muted-foreground">#{String(userProfile.profileNumber).padStart(5, '0')}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-neon-violet/10 text-neon-violet border border-neon-violet/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            {userProfile && (
              <div className="flex items-center gap-3 px-4 py-3 border-t border-border mt-2 pt-3">
                <Avatar className="w-8 h-8 border border-neon-violet/30">
                  <AvatarImage src={getAvatarUrl()} />
                  <AvatarFallback className="bg-secondary text-xs font-orbitron text-neon-violet">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userProfile.displayName}</p>
                  <p className="text-xs text-muted-foreground">#{String(userProfile.profileNumber).padStart(5, '0')}</p>
                </div>
                <button onClick={handleLogout} className="ml-auto text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neon-violet/20 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-neon-violet' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-glow-violet' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-border bg-background/50 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ShareServe. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with{' '}
            <span className="text-neon-pink">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'shareserve')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-violet hover:text-neon-cyan transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
