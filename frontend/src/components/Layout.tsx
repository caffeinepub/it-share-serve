import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Home,
  Search,
  PlusSquare,
  MessageCircle,
  Users,
  User,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotificationCounts } from '../hooks/useNotificationCounts';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: PlusSquare, label: 'Create', path: '/create' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { logout, username, isAuthenticated } = useAuth();
  const { pendingRequests } = useNotificationCounts();

  const isPublicRoute = location.pathname === '/login' || location.pathname === '/register';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // On public routes, just render children without nav
  if (isPublicRoute || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/shareserve-logo.dim_256x256.png" alt="ShareServe" className="w-10 h-10 rounded-xl" />
            <span className="font-orbitron font-bold text-xl gradient-neon-text">ShareServe</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const showBadge = item.label === 'Contacts' && pendingRequests > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                style={active ? { borderColor: 'var(--neon-cyan)40', boxShadow: '0 0 8px var(--neon-cyan)15' } : {}}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    className={active ? 'text-primary' : 'group-hover:text-primary transition-colors'}
                    style={active ? { color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 6px var(--neon-cyan))' } : {}}
                  />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                      style={{ backgroundColor: 'var(--neon-pink)', fontSize: '10px' }}
                    >
                      {pendingRequests > 9 ? '9+' : pendingRequests}
                    </span>
                  )}
                </div>
                <span className={`font-medium`} style={active ? { color: 'var(--neon-cyan)' } : {}}>{item.label}</span>
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))', color: 'var(--background)' }}
            >
              {username ? username[0].toUpperCase() : '?'}
            </div>
            <span className="text-sm font-medium text-foreground truncate">{username || 'Guest'}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen bg-background">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/shareserve-logo.dim_256x256.png" alt="ShareServe" className="w-8 h-8 rounded-lg" />
            <span className="font-orbitron font-bold text-lg gradient-neon-text">ShareServe</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))', color: 'var(--background)' }}
            >
              {username ? username[0].toUpperCase() : '?'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const showBadge = item.label === 'Contacts' && pendingRequests > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 relative ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    style={active ? { color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 6px var(--neon-cyan))' } : {}}
                  />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                      style={{ backgroundColor: 'var(--neon-pink)', fontSize: '10px' }}
                    >
                      {pendingRequests > 9 ? '9+' : pendingRequests}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium" style={active ? { color: 'var(--neon-cyan)' } : {}}>{item.label}</span>
                {active && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--neon-cyan)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
