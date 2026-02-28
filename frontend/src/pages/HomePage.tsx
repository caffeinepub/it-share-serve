import { Link } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetCallerContacts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import VideoFactsCarousel from '../components/VideoFactsCarousel';
import AnimatedHeading from '../components/AnimatedHeading';
import { MessageCircle, Users, Sparkles, TrendingUp, Zap, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: contacts = [] } = useGetCallerContacts();

  const getAvatarUrl = (profile: typeof userProfile) => {
    if (!profile) return '';
    if (profile.profilePic) return profile.profilePic.getDirectURL();
    return profile.avatarUrl;
  };

  const quickActions = [
    { label: 'Message', icon: MessageCircle, path: '/contacts', color: 'text-neon-violet', bg: 'bg-neon-violet/10 border-neon-violet/20' },
    { label: 'Contacts', icon: Users, path: '/contacts', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10 border-neon-cyan/20' },
    { label: 'Create', icon: Sparkles, path: '/create', color: 'text-neon-pink', bg: 'bg-neon-pink/10 border-neon-pink/20' },
    { label: 'Profile', icon: Star, path: '/profile', color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-neon-violet/20 p-6 md:p-8">
        <div className="absolute inset-0">
          <img src="/assets/generated/app-bg.dim_1920x1080.png" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-neon-violet" />
            <span className="text-xs text-neon-violet font-orbitron uppercase tracking-widest">Welcome Back</span>
          </div>
          <AnimatedHeading
            text={userProfile ? `Hey, ${userProfile.displayName}!` : 'Welcome to ShareServe'}
            variant="gradient"
            as="h1"
            className="text-3xl md:text-4xl font-bold mb-2"
          />
          {userProfile && (
            <p className="text-muted-foreground text-sm">
              Profile #{String(userProfile.profileNumber).padStart(5, '0')} · @{userProfile.username}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <Link to="/contacts" className="btn-neon-violet rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Start Chatting
            </Link>
            <Link to="/create" className="btn-neon-cyan rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Create
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-orbitron text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, path, color, bg }) => (
            <Link
              key={label}
              to={path}
              className={`card-dark rounded-xl p-4 flex flex-col items-center gap-2 border ${bg} hover:scale-105 transition-transform`}
            >
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-dark rounded-xl p-4 text-center border border-neon-violet/10">
          <div className="font-orbitron text-2xl font-bold text-neon-violet">{contacts.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Contacts</div>
        </div>
        <div className="card-dark rounded-xl p-4 text-center border border-neon-cyan/10">
          <div className="font-orbitron text-2xl font-bold text-neon-cyan">
            {userProfile ? `#${String(userProfile.profileNumber).padStart(5, '0')}` : '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Profile #</div>
        </div>
        <div className="card-dark rounded-xl p-4 text-center border border-neon-pink/10">
          <div className="font-orbitron text-2xl font-bold text-neon-pink">∞</div>
          <div className="text-xs text-muted-foreground mt-1">Possibilities</div>
        </div>
      </div>

      {/* Video Facts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          <h2 className="font-orbitron text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Did You Know?
          </h2>
        </div>
        <VideoFactsCarousel />
      </div>

      {/* Contacts Preview */}
      {contacts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-orbitron text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Your Contacts
            </h2>
            <Link to="/contacts" className="text-xs text-neon-violet hover:text-neon-cyan transition-colors">
              View All →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {contacts.slice(0, 8).map(contact => (
              <Link
                key={contact.username}
                to={`/chat/${contact.username}`}
                className="flex flex-col items-center gap-2 min-w-[64px] group"
              >
                <Avatar className="w-12 h-12 border-2 border-neon-violet/20 group-hover:border-neon-violet/60 transition-all">
                  <AvatarImage src={contact.profilePic?.getDirectURL() || contact.avatarUrl} />
                  <AvatarFallback className="bg-secondary text-xs font-orbitron text-neon-violet">
                    {contact.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate w-full text-center">
                  {contact.displayName.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
