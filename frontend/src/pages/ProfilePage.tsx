import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGetUserProfile, useUpdateUserProfile, useGetUserPhotos, useGetUserVideos } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit2, Loader2, Image, Video } from 'lucide-react';
import PhotoGallery from '../components/PhotoGallery';
import VideoGallery from '../components/VideoGallery';

export default function ProfilePage() {
  const { username } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile(username);
  const updateProfile = useUpdateUserProfile();
  const { data: photos = [], isLoading: photosLoading } = useGetUserPhotos(username);
  const { data: videos = [], isLoading: videosLoading } = useGetUserVideos(username);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' });
  const [editError, setEditError] = useState('');

  const openEdit = () => {
    setEditForm({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!username) return;
    if (!editForm.displayName.trim()) {
      setEditError('Display name is required');
      return;
    }
    try {
      await updateProfile.mutateAsync({
        username,
        displayName: editForm.displayName.trim(),
        bio: editForm.bio.trim(),
      });
      setEditOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Profile not found.</p>
      </div>
    );
  }

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {initials}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.displayName}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Profile #{profile.profileNumber.toString()}
              </p>
              {profile.bio && (
                <p className="text-sm text-foreground mt-2 max-w-sm">{profile.bio}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Media tabs */}
      <Tabs defaultValue="photos">
        <TabsList className="w-full">
          <TabsTrigger value="photos" className="flex-1">
            <Image className="w-4 h-4 mr-2" />
            Photos ({photos.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1">
            <Video className="w-4 h-4 mr-2" />
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

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                {editError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={editForm.displayName}
                onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
                disabled={updateProfile.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                disabled={updateProfile.isPending}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updateProfile.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
