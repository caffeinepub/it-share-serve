import { ReactNode } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useGetUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Users, MessageSquare, User, PlusSquare, LogOut, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/create', label: 'Create', icon: PlusSquare },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useGetUserProfile(username);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const displayName = profile?.displayName || username || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/shareserve-logo.dim_256x256.png"
              alt="ShareServer"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-lg text-primary">ShareServer</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate({ to: path })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{displayName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Log out"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-50">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate({ to: path })}
                className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px]">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block bg-card border-t border-border py-4 mb-0">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShareServer. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
