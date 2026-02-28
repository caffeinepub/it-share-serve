import { useState } from 'react';
import { type ExternalBlob } from '../backend';
import { X, ZoomIn, Image } from 'lucide-react';

interface PhotoGalleryProps {
  photos: ExternalBlob[];
  isLoading?: boolean;
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
        {photos.map((photo, idx) => {
          const url = photo.getDirectURL();
          return (
            <button
              key={idx}
              onClick={() => setLightboxUrl(url)}
              className="aspect-square rounded-xl overflow-hidden border border-border hover:border-neon-violet/40 transition-all group relative"
            >
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        })}
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
          />
        </div>
      )}
    </>
  );
}
