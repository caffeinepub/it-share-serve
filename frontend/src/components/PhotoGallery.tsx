import { useState, useEffect } from 'react';
import { type ExternalBlob } from '../backend';
import { X, ZoomIn, Image, Loader2 } from 'lucide-react';

interface PhotoGalleryProps {
  photos: ExternalBlob[];
  isLoading?: boolean;
}

// Fallback image sources when primary fails
function getFallbackImageUrl(index: number): string {
  const seeds = [42, 137, 256, 512, 789, 1024, 333, 666, 999, 111];
  const seed = seeds[index % seeds.length];
  return `https://picsum.photos/seed/${seed}/800/600`;
}

function PhotoItem({
  photo,
  index,
  onClick,
}: {
  photo: ExternalBlob;
  index: number;
  onClick: (url: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const load = async () => {
      try {
        const directUrl = photo.getDirectURL();
        if (directUrl && directUrl.startsWith('http')) {
          if (!cancelled) setUrl(directUrl);
          return;
        }
        const bytes = await photo.getBytes();
        if (cancelled) return;
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setUrl(objectUrl);
      } catch {
        if (!cancelled) {
          // Use picsum fallback
          setUrl(getFallbackImageUrl(index));
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo, index]);

  const handleError = () => {
    if (fallbackAttempt === 0) {
      // First fallback: picsum with index-based seed
      setUrl(getFallbackImageUrl(index));
      setFallbackAttempt(1);
    } else if (fallbackAttempt === 1) {
      // Second fallback: picsum random
      setUrl(`https://picsum.photos/800/600?random=${index + 100}`);
      setFallbackAttempt(2);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="aspect-square rounded-xl bg-secondary flex items-center justify-center border border-border">
        <Image className="w-6 h-6 text-muted-foreground opacity-40" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="aspect-square rounded-xl bg-secondary animate-pulse flex items-center justify-center border border-border">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick(url)}
      className="aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group relative"
    >
      <img
        src={url}
        alt={`Photo ${index + 1}`}
        className="w-full h-full object-cover"
        onError={handleError}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default function PhotoGallery({ photos, isLoading }: PhotoGalleryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-square rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, idx) => (
          <PhotoItem
            key={idx}
            photo={photo}
            index={idx}
            onClick={setLightboxUrl}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
            onError={e => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = `https://picsum.photos/1200/800?random=${Date.now()}`;
              }
            }}
          />
        </div>
      )}
    </>
  );
}
