import { useAuth } from '../hooks/useAuth';
import { useGetUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Camera, Video, Users, MessageSquare, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile(username);

  const displayName = profile?.displayName || username || 'there';

  const quickActions = [
    {
      icon: Camera,
      label: 'Share a Photo',
      description: 'Upload or generate an image',
      path: '/create',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      icon: Video,
      label: 'Share a Video',
      description: 'Upload or generate a video',
      path: '/create',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      icon: Users,
      label: 'Find Contacts',
      description: 'Connect with other users',
      path: '/contacts',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      description: 'Chat with your contacts',
      path: '/contacts',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-8">
        <div className="relative z-10">
          {isLoading ? (
            <Skeleton className="h-9 w-64 mb-2" />
          ) : (
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary">{displayName}</span>! 👋
            </h1>
          )}
          <p className="text-muted-foreground mt-2 max-w-lg">
            Share photos and videos, connect with friends, and start conversations — all in one place.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate({ to: '/create' })}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Something
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <img
            src="/assets/generated/app-bg.dim_1920x1080.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, label, description, path, color, bg }) => (
            <button
              key={label}
              onClick={() => navigate({ to: path })}
              className="group flex flex-col items-start gap-3 p-5 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-card/80 transition-all text-left"
            >
              <div className={`p-2.5 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Profile summary */}
      {profile && (
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Profile</h2>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/profile' })}>
              Edit Profile
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile.displayName}</p>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
