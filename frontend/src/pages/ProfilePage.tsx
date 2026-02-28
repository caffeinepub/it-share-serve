import React, { useState } from 'react';
import { Edit2, Image, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGetUserProfile, useUpdateUserProfile, useGetUserPhotos, useGetUserVideos } from '../hooks/useQueries';
import PhotoGallery from '../components/PhotoGallery';
import VideoGallery from '../components/VideoGallery';
import AnimatedHeading from '../components/AnimatedHeading';

type MediaTab = 'photos' | 'videos';

export default function ProfilePage() {
  const { username } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile(username || '');
  const updateProfile = useUpdateUserProfile();
  const { data: photos = [], isLoading: photosLoading } = useGetUserPhotos(username || '');
  const { data: videos = [], isLoading: videosLoading } = useGetUserVideos(username || '');

  const [activeTab, setActiveTab] = useState<MediaTab>('photos');
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');

  const handleEditOpen = () => {
    setEditDisplayName(profile?.displayName || '');
    setEditBio(profile?.bio || '');
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!username) return;
    await updateProfile.mutateAsync({ username, displayName: editDisplayName, bio: editBio });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="relative overflow-hidden">
        <div
          className="h-32 md:h-48"
          style={{
            background: 'linear-gradient(135deg, var(--neon-cyan)20, var(--neon-violet)20, var(--neon-pink)20)',
          }}
        />
        <div className="absolute inset-0 flex items-end px-4 pb-0">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-[-40px] md:mb-[-48px] relative z-10"
            style={{
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
              borderColor: 'var(--background)',
              color: 'var(--background)',
              boxShadow: '0 0 20px var(--neon-cyan)',
            }}
          >
            {profile?.displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-14 md:pt-16 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <AnimatedHeading
              text={profile?.displayName || username || 'User'}
              variant="glow"
              className="text-xl font-orbitron font-bold"
            />
            <p className="text-muted-foreground text-sm mt-0.5">@{username}</p>
            {profile?.bio && (
              <p className="text-foreground/80 text-sm mt-2 max-w-sm">{profile.bio}</p>
            )}
          </div>
          <button
            onClick={handleEditOpen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--neon-cyan)20, var(--neon-violet)20)',
              border: '1px solid var(--neon-cyan)40',
              color: 'var(--neon-cyan)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 12px var(--neon-cyan)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
          >
            <Edit2 size={15} />
            Edit
          </button>
        </div>
      </div>

      {/* Media Tabs */}
      <div className="px-4 border-b border-border/50">
        <div className="flex gap-4">
          {[
            { id: 'photos' as MediaTab, label: 'Photos', icon: Image },
            { id: 'videos' as MediaTab, label: 'Videos', icon: Video },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                style={isActive ? { borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' } : {}}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery */}
      <div className="p-4">
        {activeTab === 'photos' ? (
          <PhotoGallery photos={photos} isLoading={photosLoading} />
        ) : (
          <VideoGallery videos={videos} isLoading={videosLoading} />
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-card rounded-2xl p-6 border"
            style={{ borderColor: 'var(--neon-cyan)40', boxShadow: '0 0 30px var(--neon-cyan)20' }}
          >
            <h3 className="font-orbitron font-bold text-lg gradient-neon-text mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none transition-all duration-200"
                  onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none transition-all duration-200 resize-none"
                  onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={updateProfile.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                  color: 'var(--background)',
                }}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
