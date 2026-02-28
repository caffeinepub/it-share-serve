import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Zap, Shield, MessageCircle, Image, Video } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    { icon: MessageCircle, label: 'Instant Messaging', color: 'text-neon-violet' },
    { icon: Image, label: 'Photo Sharing', color: 'text-neon-cyan' },
    { icon: Video, label: 'Video Sharing', color: 'text-neon-pink' },
    { icon: Zap, label: 'AI Generation', color: 'text-neon-green' },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'oklch(0.72 0.25 290)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'oklch(0.75 0.2 195)' }} />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="/assets/generated/shareserve-logo.dim_256x256.png"
                alt="ShareServe"
                className="w-20 h-20 animate-float"
              />
              <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{ background: 'oklch(0.72 0.25 290)' }} />
            </div>
          </div>
          <h1 className="font-orbitron text-4xl font-bold animate-shimmer mb-2">
            SHARESERVE
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Connect · Share · Create
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map(({ icon: Icon, label, color }) => (
            <div key={label} className="card-dark rounded-xl p-3 flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Login Card */}
        <div className="card-glow rounded-2xl p-8 animate-neon-border">
          <h2 className="font-orbitron text-xl font-semibold text-center mb-2 text-neon-violet text-glow-violet">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Sign in securely with your Internet Identity
          </p>

          <button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full btn-neon-violet rounded-xl py-3 px-6 font-orbitron font-semibold text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="w-3 h-3" />
            <span>Secured by Internet Identity</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          New to ShareServe? Sign in to create your account.
        </p>
      </div>
    </div>
  );
}
