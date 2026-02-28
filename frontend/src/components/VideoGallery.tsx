import { type ExternalBlob } from '../backend';
import { Video } from 'lucide-react';

interface VideoGalleryProps {
  videos: ExternalBlob[];
  isLoading?: boolean;
}

export default function VideoGallery({ videos, isLoading }: VideoGalleryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-video rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Video className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No videos yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {videos.map((video, idx) => {
        const url = video.getDirectURL();
        return (
          <div
            key={idx}
            className="rounded-xl overflow-hidden border border-border hover:border-neon-cyan/40 transition-all"
          >
            <video
              src={url}
              controls
              className="w-full aspect-video bg-black"
              preload="metadata"
            />
          </div>
        );
      })}
    </div>
  );
}
