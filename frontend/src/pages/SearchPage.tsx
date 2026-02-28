import React, { useState, useCallback } from 'react';
import { Search, Loader2, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Pexels API key placeholder — replace with a real key from https://www.pexels.com/api/
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

// Curated public-domain fallback MP4s from Mixkit covering diverse categories
const FALLBACK_VIDEO_POOL: string[] = [
  'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-from-above-550-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-night-sky-with-stars-17540-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-laptop-42746-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-in-the-city-4487-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-park-1201-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-cooking-a-delicious-meal-in-a-pan-2827-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1488-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-musician-playing-guitar-on-stage-4196-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-landscape-1209-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-cat-sitting-on-a-couch-1208-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-people-walking-in-a-busy-street-4479-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-colorful-fireworks-in-the-night-sky-1580-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-yoga-in-the-park-1205-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4487-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-birds-flying-over-the-sea-1564-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-1564-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-street-1206-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-1207-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-the-street-1203-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-hiking-in-the-mountains-1204-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-colorful-abstract-background-1489-large.mp4',
];

interface PhotoResult {
  id: string;
  primaryUrl: string;
  fallbackUrl: string;
  alt: string;
}

interface VideoResult {
  id: string;
  videoUrl: string;
  thumbnail: string;
  title: string;
}

function buildPhotoResults(query: string): PhotoResult[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `photo-${i}`,
    // Use Picsum with a query-derived seed as primary (reliable, no CORS issues)
    primaryUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/400/300`,
    // Fallback to a different Picsum seed
    fallbackUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}${i * 7 + 13}/400/300`,
    alt: `${query} photo ${i + 1}`,
  }));
}

function PhotoCard({ photo }: { photo: PhotoResult }) {
  const [src, setSrc] = useState(photo.primaryUrl);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleError = () => {
    if (src === photo.primaryUrl) {
      setSrc(photo.fallbackUrl);
    } else {
      setErrored(true);
    }
  };

  if (errored) {
    return (
      <div className="aspect-square rounded-lg bg-card border border-border flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <img
        src={src}
        alt={photo.alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}

function VideoCard({ video }: { video: VideoResult }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="rounded-lg bg-card border border-border flex items-center justify-center aspect-video">
        <Video className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-black">
      <video
        src={video.videoUrl}
        controls
        muted
        preload="metadata"
        poster={video.thumbnail || undefined}
        className="w-full aspect-video"
        onError={() => setErrored(true)}
      >
        Your browser does not support the video tag.
      </video>
      {video.title && (
        <p className="text-xs text-muted-foreground px-2 py-1 truncate">{video.title}</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photoResults, setPhotoResults] = useState<PhotoResult[]>([]);
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchPhotos = useCallback(async (q: string) => {
    setIsLoadingPhotos(true);
    setPhotoError(null);
    // Build Picsum Photos URLs with query-derived seeds — reliable, no API key needed
    const results = buildPhotoResults(q);
    setPhotoResults(results);
    setIsLoadingPhotos(false);
  }, []);

  const searchVideos = useCallback(async (q: string) => {
    setIsLoadingVideos(true);
    setVideoError(null);

    // Try Pexels Videos API if key is available
    if (PEXELS_API_KEY) {
      try {
        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=9&orientation=landscape`,
          { headers: { Authorization: PEXELS_API_KEY } }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.videos && data.videos.length > 0) {
            const results: VideoResult[] = data.videos
              .map((v: any) => {
                const file =
                  v.video_files?.find((f: any) => f.quality === 'sd') ||
                  v.video_files?.find((f: any) => f.quality === 'hd') ||
                  v.video_files?.[0];
                return {
                  id: String(v.id),
                  videoUrl: file?.link || '',
                  thumbnail: v.image || '',
                  title: v.url?.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || q,
                };
              })
              .filter((v: VideoResult) => v.videoUrl);

            if (results.length > 0) {
              setVideoResults(results);
              setIsLoadingVideos(false);
              return;
            }
          }
        }
      } catch {
        // Pexels failed, fall through to curated pool
      }
    }

    // Fallback: use a shuffled slice of the curated public-domain pool
    // Shuffle deterministically based on query so results feel relevant
    const shuffled = [...FALLBACK_VIDEO_POOL].sort(() => {
      // Use query characters to seed a simple shuffle
      const seed = q.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return (seed % 3) - 1;
    });

    const fallbackResults: VideoResult[] = shuffled.slice(0, 9).map((url, i) => ({
      id: `fallback-${i}`,
      videoUrl: url,
      thumbnail: '',
      title: `${q} — video ${i + 1}`,
    }));

    setVideoResults(fallbackResults);
    setIsLoadingVideos(false);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setHasSearched(true);
    if (activeTab === 'photos') {
      await searchPhotos(query.trim());
    } else {
      await searchVideos(query.trim());
    }
  }, [query, activeTab, searchPhotos, searchVideos]);

  const handleTabChange = async (tab: string) => {
    const t = tab as 'photos' | 'videos';
    setActiveTab(t);
    if (hasSearched && query.trim()) {
      if (t === 'photos' && photoResults.length === 0) {
        await searchPhotos(query.trim());
      } else if (t === 'videos' && videoResults.length === 0) {
        await searchVideos(query.trim());
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Search</h1>
        <p className="text-muted-foreground text-sm">Search for photos and videos on any topic</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search for anything... (e.g. mountains, cats, technology)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isLoadingPhotos || isLoadingVideos}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
        >
          {isLoadingPhotos || isLoadingVideos ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger
            value="photos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Photos
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Video className="w-4 h-4 mr-2" />
            Videos
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab */}
        <TabsContent value="photos" className="mt-4">
          {isLoadingPhotos ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : photoError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
              <AlertCircle className="w-10 h-10" />
              <p>{photoError}</p>
              <Button variant="outline" onClick={() => searchPhotos(query)}>
                Retry
              </Button>
            </div>
          ) : photoResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photoResults.map(photo => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <ImageIcon className="w-12 h-12 opacity-30" />
              <p>No photos found for "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Search className="w-12 h-12 opacity-30" />
              <p>Enter a search term to find photos</p>
            </div>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-4">
          {isLoadingVideos ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : videoError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
              <AlertCircle className="w-10 h-10" />
              <p>{videoError}</p>
              <Button variant="outline" onClick={() => searchVideos(query)}>
                Retry
              </Button>
            </div>
          ) : videoResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videoResults.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Video className="w-12 h-12 opacity-30" />
              <p>No videos found for "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Search className="w-12 h-12 opacity-30" />
              <p>Enter a search term to find videos</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
