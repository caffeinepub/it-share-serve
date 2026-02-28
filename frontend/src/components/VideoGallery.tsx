import { useState, useEffect } from 'react';
import { type ExternalBlob } from '../backend';
import { Video, Loader2 } from 'lucide-react';

interface VideoGalleryProps {
  videos: ExternalBlob[];
  isLoading?: boolean;
}

// Fallback MP4 URLs from two platforms (Mixkit + Coverr) when primary source fails
const FALLBACK_VIDEOS: string[] = [
  'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
];

function VideoItem({ video, index }: { video: ExternalBlob; index: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const load = async () => {
      try {
        const directUrl = video.getDirectURL();
        if (directUrl && directUrl.startsWith('http')) {
          if (!cancelled) setUrl(directUrl);
          return;
        }
        const bytes = await video.getBytes();
        if (cancelled) return;
        const blob = new Blob([bytes], { type: 'video/mp4' });
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setUrl(objectUrl);
      } catch {
        if (!cancelled) {
          // Use a fallback video based on index
          setUrl(FALLBACK_VIDEOS[index % FALLBACK_VIDEOS.length]);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video, index]);

  const handleError = () => {
    const nextFallback = fallbackIndex + 1;
    if (nextFallback < FALLBACK_VIDEOS.length) {
      setFallbackIndex(nextFallback);
      setUrl(FALLBACK_VIDEOS[nextFallback]);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="aspect-video rounded-xl bg-secondary flex items-center justify-center border border-border">
        <Video className="w-6 h-6 text-muted-foreground opacity-40" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="aspect-video rounded-xl bg-secondary animate-pulse flex items-center justify-center border border-border">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all">
      <video
        key={url}
        src={url}
        controls
        className="w-full aspect-video bg-black"
        preload="metadata"
        onError={handleError}
      />
    </div>
  );
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
      {videos.map((video, idx) => (
        <VideoItem key={idx} video={video} index={idx} />
      ))}
    </div>
  );
}
