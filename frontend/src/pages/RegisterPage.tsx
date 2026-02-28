import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActor } from '../hooks/useActor';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, displayName, password, confirmPassword, bio } = formData;

    if (!username.trim() || !displayName.trim() || !password.trim()) {
      setError('Username, display name, and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!actor) {
      setError('Connecting to network... please try again.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await actor.registerUser(username.trim(), password, displayName.trim(), bio.trim());
      login(username.trim());
      navigate({ to: '/' });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already taken')) {
        setError('Username is already taken. Please choose another.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--neon-violet)';
    e.target.style.boxShadow = '0 0 8px var(--neon-violet)';
  };
  const inputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '';
    e.target.style.boxShadow = '';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--neon-violet)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--neon-pink)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/assets/generated/shareserve-logo.dim_256x256.png"
              alt="ShareServe"
              className="w-16 h-16 rounded-2xl"
              style={{ boxShadow: '0 0 20px var(--neon-violet)' }}
            />
          </div>
          <h1 className="font-orbitron font-bold text-3xl gradient-neon-text mb-2">ShareServe</h1>
          <p className="text-muted-foreground text-sm">Join the community</p>
        </div>

        {/* Register Card */}
        <div
          className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 1px var(--neon-violet)' }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Your display name"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 pr-12 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  autoComplete="new-password"
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

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 pr-12 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Bio <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={2}
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 resize-none"
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-pink))',
                boxShadow: isLoading ? 'none' : '0 0 20px var(--neon-violet)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate({ to: '/login' })}
                className="font-medium transition-colors"
                style={{ color: 'var(--neon-violet)' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.textShadow = '0 0 8px var(--neon-violet)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.textShadow = ''; }}
              >
                Login here
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
              style={{ color: 'var(--neon-violet)' }}
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
