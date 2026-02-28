import { useState } from 'react';
import { useRegister } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { User, AtSign, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const { mutateAsync: register, isPending } = useRegister();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      toast.error('Username and display name are required');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }
    try {
      await register({ username: username.trim(), displayName: displayName.trim(), avatarUrl: '', bio: bio.trim() });
      toast.success('Account created! Welcome to ShareServe 🚀');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'oklch(0.72 0.25 290)' }} />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'oklch(0.75 0.2 195)' }} />

      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/assets/generated/shareserve-logo.dim_256x256.png" alt="ShareServe" className="w-16 h-16 animate-float" />
          </div>
          <h1 className="font-orbitron text-3xl font-bold animate-shimmer mb-1">CREATE ACCOUNT</h1>
          <p className="text-muted-foreground text-sm">Set up your ShareServe profile</p>
        </div>

        <div className="card-glow rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neon-violet mb-1.5 uppercase tracking-wider">
                Username *
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  maxLength={30}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Letters, numbers, underscores only</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neon-cyan mb-1.5 uppercase tracking-wider">
                Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neon-pink mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-neon-violet rounded-xl py-3 px-6 font-orbitron font-semibold text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Sign out and use a different identity
          </button>
        </div>
      </div>
    </div>
  );
}
