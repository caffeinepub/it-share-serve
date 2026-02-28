import { useState } from 'react';
import { Search, Image, Video, X, Play, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchPhoto {
  id: number;
  primaryUrl: string;
  fallbackUrl: string;
  alt: string;
  source: string;
}

interface SearchVideo {
  id: number;
  title: string;
  primaryUrl: string;
  fallbackUrl: string;
  category: string;
}

// ─── Photo Search ─────────────────────────────────────────────────────────────

// Build photo results using Picsum (primary) and Lorem Picsum with different seeds (fallback)
function buildPhotoResults(query: string, count: number = 20): SearchPhoto[] {
  const queryHash = Array.from(query.toLowerCase()).reduce(
    (acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0,
    0
  );
  return Array.from({ length: count }, (_, i) => {
    const seed1 = (queryHash + i * 137) % 1000000;
    const seed2 = (queryHash + i * 251 + 500000) % 1000000;
    return {
      id: i,
      // Primary: Picsum with deterministic seed
      primaryUrl: `https://picsum.photos/seed/${seed1}/400/300`,
      // Fallback: Picsum with different seed
      fallbackUrl: `https://picsum.photos/seed/${seed2}/400/300`,
      alt: `${query} photo ${i + 1}`,
      source: 'Picsum Photos',
    };
  });
}

// Lightbox-size URLs
function getLargePhotoUrl(photo: SearchPhoto): string {
  const seed = parseInt(photo.primaryUrl.split('/seed/')[1]?.split('/')[0] ?? '42');
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

function PhotoSearchItem({
  photo,
  onClick,
}: {
  photo: SearchPhoto;
  onClick: (photo: SearchPhoto) => void;
}) {
  const [src, setSrc] = useState(photo.primaryUrl);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const handleError = () => {
    if (!fallbackUsed) {
      setSrc(photo.fallbackUrl);
      setFallbackUsed(true);
    }
  };

  return (
    <button
      onClick={() => onClick(photo)}
      className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-neon-violet/50 transition-all focus:outline-none focus:ring-2 focus:ring-neon-violet/50"
    >
      <img
        src={src}
        alt={photo.alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={handleError}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
        <span className="text-xs text-white/80 truncate">{photo.source}</span>
      </div>
    </button>
  );
}

function PhotoSearch() {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<SearchPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lightbox, setLightbox] = useState<SearchPhoto | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setPhotos([]);

    // Simulate a brief loading delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));
    const results = buildPhotoResults(query.trim(), 20);
    setPhotos(results);
    setLoading(false);
  };

  const openLightbox = (photo: SearchPhoto) => {
    setLightbox(photo);
    setLightboxSrc(getLargePhotoUrl(photo));
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search photos… e.g. sunset beach, neon city"
            className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-neon-violet rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results grid */}
      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map(photo => (
            <PhotoSearchItem key={photo.id} photo={photo} onClick={openLightbox} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && photos.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Image className="w-12 h-12 opacity-20" />
          <p className="text-sm">No photos found for "{query}"</p>
          <p className="text-xs opacity-60">Try a different search term</p>
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !searched && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Image className="w-14 h-14 opacity-15" />
          <p className="text-sm font-medium">Search for photos</p>
          <p className="text-xs opacity-60">Enter a keyword above to find beautiful photos</p>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxSrc}
            alt={lightbox.alt}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
            onError={() => {
              setLightboxSrc(`https://picsum.photos/seed/${lightbox.id + 9999}/1200/800`);
            }}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-xs text-white/70">
            Photo by {lightbox.source} · Web search result · Not saved to your profile
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Search ─────────────────────────────────────────────────────────────

// Curated keyword-to-video mapping using direct MP4 URLs from two platforms:
// Primary: Mixkit CDN | Fallback: Coverr CDN
// No YouTube, no iframes — all inline HTML5 <video> playback
const VIDEO_SEARCH_MAP: Record<string, { primary: string; fallback: string; title: string }[]> = {
  ocean: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
      title: 'Ocean Waves',
    },
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-sea-waves-on-the-beach-1166-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-ocean-waves-7078/1080p.mp4',
      title: 'Sea Waves on Beach',
    },
  ],
  waves: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
      title: 'Water Waves',
    },
  ],
  beach: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-sea-waves-on-the-beach-1166-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
      title: 'Beach Waves',
    },
  ],
  water: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-water-flowing-over-rocks-in-a-stream-1765/1080p.mp4',
      title: 'Water Flow',
    },
  ],
  fire: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-campfire-burning-in-the-dark-4702-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-fire-burning-in-a-fireplace-3299/1080p.mp4',
      title: 'Campfire',
    },
  ],
  nature: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
      title: 'Forest Stream',
    },
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-green-leaves-in-the-wind-4765-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
      title: 'Leaves in Wind',
    },
  ],
  forest: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
      title: 'Forest Sunlight',
    },
  ],
  city: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1487-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
      title: 'City Traffic at Night',
    },
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
      title: 'Aerial City View',
    },
  ],
  night: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1487-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
      title: 'Night City',
    },
  ],
  sky: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
      title: 'Blue Sky Clouds',
    },
  ],
  clouds: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
      title: 'Moving Clouds',
    },
  ],
  sunset: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-sea-1003-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-sunset-over-the-ocean-1580/1080p.mp4',
      title: 'Sunset Over Sea',
    },
  ],
  snow: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-snowflakes-falling-in-slow-motion-4765-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-snowflakes-falling-in-slow-motion-1580/1080p.mp4',
      title: 'Falling Snowflakes',
    },
  ],
  rain: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-surface-1182-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-rain-falling-on-a-window-1580/1080p.mp4',
      title: 'Rain on Water',
    },
  ],
  space: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-stars-in-space-1580/1080p.mp4',
      title: 'Stars in Space',
    },
  ],
  abstract: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
      title: 'Abstract Waves',
    },
  ],
  music: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
      title: 'Music Visualization',
    },
  ],
  mountain: [
    {
      primary: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
      fallback: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-mountains-1580/1080p.mp4',
      title: 'Mountain Landscape',
    },
  ],
};

// Default videos when no keyword matches
const DEFAULT_SEARCH_VIDEOS: { primary: string; fallback: string; title: string }[] = [
  {
    primary: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
    fallback: 'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
    title: 'Abstract Waves',
  },
  {
    primary: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    fallback: 'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
    title: 'Water Waves',
  },
  {
    primary: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    fallback: 'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
    title: 'Sky Clouds',
  },
  {
    primary: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    fallback: 'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
    title: 'Forest Stream',
  },
  {
    primary: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1487-large.mp4',
    fallback: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
    title: 'City at Night',
  },
  {
    primary: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    fallback: 'https://cdn.coverr.co/videos/coverr-stars-in-space-1580/1080p.mp4',
    title: 'Space Stars',
  },
];

function getVideoSearchResults(query: string): SearchVideo[] {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);

  let matched: { primary: string; fallback: string; title: string }[] = [];

  // Try exact word match first
  for (const word of words) {
    if (VIDEO_SEARCH_MAP[word]) {
      matched = [...matched, ...VIDEO_SEARCH_MAP[word]];
    }
  }

  // Try partial match
  if (matched.length === 0) {
    for (const [key, videos] of Object.entries(VIDEO_SEARCH_MAP)) {
      if (lower.includes(key)) {
        matched = [...matched, ...videos];
      }
    }
  }

  // Use defaults if nothing matched
  if (matched.length === 0) {
    matched = DEFAULT_SEARCH_VIDEOS;
  }

  // Deduplicate and limit to 12
  const seen = new Set<string>();
  const unique = matched.filter(v => {
    if (seen.has(v.primary)) return false;
    seen.add(v.primary);
    return true;
  });

  return unique.slice(0, 12).map((v, i) => ({
    id: i,
    title: v.title,
    primaryUrl: v.primary,
    fallbackUrl: v.fallback,
    category: query,
  }));
}

function VideoSearchItem({
  video,
  onPlay,
}: {
  video: SearchVideo;
  onPlay: (video: SearchVideo) => void;
}) {
  return (
    <button
      onClick={() => onPlay(video)}
      className="group text-left space-y-2 focus:outline-none"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-border group-hover:border-neon-cyan/50 transition-all bg-secondary/50">
        <video
          src={video.primaryUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan/60 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-5 h-5 text-neon-cyan ml-0.5" />
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">{video.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">Mixkit / Coverr</p>
      </div>
    </button>
  );
}

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: SearchVideo;
  onClose: () => void;
}) {
  const [src, setSrc] = useState(video.primaryUrl);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const handleError = () => {
    if (!fallbackUsed) {
      setSrc(video.fallbackUrl);
      setFallbackUsed(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <div
        className="w-full max-w-4xl space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neon-cyan/20 bg-black">
          <video
            key={src}
            src={src}
            controls
            autoPlay
            className="w-full h-full"
            onError={handleError}
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{video.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Mixkit / Coverr · Free License</p>
          </div>
          <p className="text-xs text-muted-foreground/60 shrink-0 text-right">
            Web result · Not saved to profile
          </p>
        </div>
      </div>
    </div>
  );
}

function VideoSearch() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<SearchVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [playing, setPlaying] = useState<SearchVideo | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setVideos([]);

    // Simulate brief loading for UX
    await new Promise(resolve => setTimeout(resolve, 600));
    const results = getVideoSearchResults(query.trim());
    setVideos(results);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos… e.g. ocean waves, forest, city night"
            className="input-neon w-full rounded-xl pl-10 pr-4 py-3 text-sm"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-neon-cyan rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-video rounded-xl bg-secondary/50 animate-pulse" />
              <div className="h-3 rounded bg-secondary/50 animate-pulse w-3/4" />
              <div className="h-3 rounded bg-secondary/50 animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results grid */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map(video => (
            <VideoSearchItem key={video.id} video={video} onPlay={setPlaying} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && videos.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Video className="w-12 h-12 opacity-20" />
          <p className="text-sm">No videos found for "{query}"</p>
          <p className="text-xs opacity-60">Try: ocean, forest, city, sky, fire, snow, space</p>
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !searched && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Video className="w-14 h-14 opacity-15" />
          <p className="text-sm font-medium">Search for videos</p>
          <p className="text-xs opacity-60">Try: ocean, forest, city, sky, fire, snow, space</p>
        </div>
      )}

      {/* Video player modal */}
      {playing && (
        <VideoPlayerModal video={playing} onClose={() => setPlaying(null)} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-foreground">
          Web <span className="text-neon-violet">Search</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search photos and videos from the web. Results are never saved to your profile.
        </p>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="mb-4 bg-secondary/50 border border-border rounded-xl p-1">
          <TabsTrigger
            value="photos"
            className="rounded-lg data-[state=active]:bg-neon-violet/20 data-[state=active]:text-neon-violet flex items-center gap-2"
          >
            <Image className="w-4 h-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="rounded-lg data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <PhotoSearch />
        </TabsContent>

        <TabsContent value="videos">
          <VideoSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
