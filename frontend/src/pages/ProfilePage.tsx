import { useState, useRef } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  useGetCallerUserProfile,
  useGetUserProfile,
  useGetUserPhotos,
  useGetUserVideos,
  useUpdateProfile,
  useUploadProfilePic,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob } from '../backend';
import PhotoGallery from '../components/PhotoGallery';
import VideoGallery from '../components/VideoGallery';
import AnimatedHeading from '../components/AnimatedHeading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Edit2, Camera, Image, Video, User, AtSign, FileText, Hash, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const params = useParams({ strict: false }) as { userId?: string };
  const userId = params.userId;

  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = !userId;

  const { data: myProfile, isLoading: myProfileLoading } = useGetCallerUserProfile();
  const { data: otherProfile, isLoading: otherProfileLoading } = useGetUserProfile(
    isOwnProfile ? undefined : userId
  );

  const profile = isOwnProfile ? myProfile : otherProfile;
  const isLoading = isOwnProfile ? myProfileLoading : otherProfileLoading;

  const profilePrincipal = isOwnProfile ? myPrincipal : userId;
  const { data: photos = [], isLoading: photosLoading } = useGetUserPhotos(profilePrincipal);
  const { data: videos = [], isLoading: videosLoading } = useGetUserVideos(profilePrincipal);

  const updateProfile = useUpdateProfile();
  const uploadProfilePic = useUploadProfilePic();

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    if (!profile) return;
    setEditDisplayName(profile.displayName);
    setEditBio(profile.bio);
    setEditAvatarUrl(profile.avatarUrl);
    setAvatarPreview(null);
    setAvatarFile(null);
    setUploadProgress(0);
    setEditOpen(true);
  };

  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSave = async () => {
    try {
      // Upload new avatar pic if selected
      if (avatarFile) {
        const bytes = new Uint8Array(await avatarFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(pct => setUploadProgress(pct));
        await uploadProfilePic.mutateAsync(blob);
      }
      await updateProfile.mutateAsync({
        displayName: editDisplayName.trim(),
        avatarUrl: editAvatarUrl.trim(),
        bio: editBio.trim(),
      });
      toast.success('Profile updated!');
      setEditOpen(false);
      setAvatarFile(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const getAvatarUrl = () => {
    if (profile?.profilePic) return profile.profilePic.getDirectURL();
    if (profile?.avatarUrl) return profile.avatarUrl;
    return '';
  };

  const getInitials = () => {
    if (profile?.displayName) return profile.displayName.slice(0, 2).toUpperCase();
    return 'SS';
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
        <div className="card-dark rounded-2xl p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-secondary animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-secondary rounded-lg animate-pulse w-48" />
              <div className="h-4 bg-secondary rounded-lg animate-pulse w-32" />
              <div className="h-4 bg-secondary rounded-lg animate-pulse w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <User className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-medium">Profile not found</p>
      </div>
    );
  }

  const isSaving = updateProfile.isPending || uploadProfilePic.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Profile Card */}
      <div className="card-glow rounded-2xl p-6 border border-neon-violet/20">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20 border-2 border-neon-violet/40">
              <AvatarImage src={getAvatarUrl()} />
              <AvatarFallback className="bg-secondary text-xl font-orbitron text-neon-violet">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-neon-violet border-2 border-background flex items-center justify-center hover:bg-neon-violet/80 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-orbitron font-bold text-xl gradient-text">{profile.displayName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AtSign className="w-3 h-3" />
                    {profile.username}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neon-cyan">
                    <Hash className="w-3 h-3" />
                    {String(profile.profileNumber).padStart(5, '0')}
                  </span>
                </div>
              </div>
              {isOwnProfile && (
                <button
                  onClick={openEdit}
                  className="btn-neon-violet rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 flex-shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <div className="font-orbitron font-bold text-neon-violet">{photos.length}</div>
                <div className="text-xs text-muted-foreground">Photos</div>
              </div>
              <div className="text-center">
                <div className="font-orbitron font-bold text-neon-cyan">{videos.length}</div>
                <div className="text-xs text-muted-foreground">Videos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Tabs */}
      <Tabs defaultValue="photos">
        <TabsList className="bg-secondary/50 border border-border w-full">
          <TabsTrigger value="photos" className="flex-1 flex items-center gap-2 data-[state=active]:bg-neon-violet/20 data-[state=active]:text-neon-violet">
            <Image className="w-4 h-4" />
            Photos ({photos.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 flex items-center gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
            <Video className="w-4 h-4" />
            Videos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-4">
          <PhotoGallery photos={photos} isLoading={photosLoading} />
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          <VideoGallery videos={videos} isLoading={videosLoading} />
        </TabsContent>
      </Tabs>

      {/* Hidden avatar file input (for quick avatar change outside modal) */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          if (e.target.files?.[0]) {
            handleAvatarSelect(e.target.files[0]);
            openEdit();
          }
        }}
      />

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border border-neon-violet/30 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron gradient-text">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-neon-violet/40">
                  <AvatarImage src={avatarPreview || getAvatarUrl()} />
                  <AvatarFallback className="bg-secondary text-lg font-orbitron text-neon-violet">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {avatarPreview && (
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(avatarPreview);
                      setAvatarPreview(null);
                      setAvatarFile(null);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = e => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleAvatarSelect(file);
                    };
                    input.click();
                  }}
                  className="w-full border border-dashed border-neon-violet/40 rounded-xl py-2 text-xs text-neon-violet hover:bg-neon-violet/5 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload New Photo
                </button>
                <p className="text-xs text-muted-foreground text-center">or enter URL below</p>
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-xs font-medium text-neon-violet mb-1.5 uppercase tracking-wider">
                Avatar URL
              </label>
              <input
                type="url"
                value={editAvatarUrl}
                onChange={e => setEditAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="input-neon w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-medium text-neon-cyan mb-1.5 uppercase tracking-wider">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="input-neon w-full rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-medium text-neon-pink mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  className="input-neon w-full rounded-xl pl-10 pr-4 py-2.5 text-sm resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>

            {/* Upload progress */}
            {uploadProfilePic.isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading avatar...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setEditOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !editDisplayName.trim()}
              className="btn-neon-violet rounded-xl px-5 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
