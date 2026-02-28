import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActor } from '../hooks/useActor';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    if (!actor) {
      setError('Connecting to network... please try again.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const success = await actor.loginUser(username.trim(), password);
      if (success) {
        login(username.trim());
        navigate({ to: '/' });
      } else {
        setError('Invalid username or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--neon-cyan)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--neon-violet)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: 'var(--neon-pink)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/assets/generated/shareserve-logo.dim_256x256.png"
              alt="ShareServe"
              className="w-16 h-16 rounded-2xl"
              style={{ boxShadow: '0 0 20px var(--neon-cyan)' }}
            />
          </div>
          <h1 className="font-orbitron font-bold text-3xl gradient-neon-text mb-2">ShareServe</h1>
          <p className="text-muted-foreground text-sm">Connect. Create. Share.</p>
        </div>

        {/* Login Card */}
        <div
          className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 1px var(--neon-cyan)' }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 pr-12 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                  onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                boxShadow: isLoading ? 'none' : '0 0 20px var(--neon-cyan)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate({ to: '/register' })}
                className="font-medium transition-colors"
                style={{ color: 'var(--neon-cyan)' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.textShadow = '0 0 8px var(--neon-cyan)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.textShadow = ''; }}
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
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
