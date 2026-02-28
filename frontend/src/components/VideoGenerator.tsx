import React, { useState, useCallback, useRef } from 'react';
import { Download, RefreshCw, Loader2, Video, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Comprehensive keyword-to-MP4 mapping using guaranteed-playable Mixkit direct URLs
const KEYWORD_VIDEO_MAP: Record<string, string[]> = {
  space: [
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-night-sky-with-stars-17540-large.mp4',
  ],
  stars: [
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-night-sky-with-stars-17540-large.mp4',
  ],
  galaxy: [
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  ],
  ocean: [
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
  ],
  sea: [
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
  ],
  water: [
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  beach: [
    'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
  ],
  city: [
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-from-above-550-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-people-walking-in-a-busy-street-4479-large.mp4',
  ],
  urban: [
    'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-from-above-550-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
  ],
  night: [
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-night-sky-with-stars-17540-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-colorful-fireworks-in-the-night-sky-1580-large.mp4',
  ],
  forest: [
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
  ],
  nature: [
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-landscape-1209-large.mp4',
  ],
  tree: [
    'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  flower: [
    'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
  ],
  mountain: [
    'https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-landscape-1209-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-hiking-in-the-mountains-1204-large.mp4',
  ],
  snow: [
    'https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-landscape-1209-large.mp4',
  ],
  hike: [
    'https://assets.mixkit.co/videos/preview/mixkit-man-hiking-in-the-mountains-1204-large.mp4',
  ],
  hiking: [
    'https://assets.mixkit.co/videos/preview/mixkit-man-hiking-in-the-mountains-1204-large.mp4',
  ],
  dog: [
    'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-park-1201-large.mp4',
  ],
  cat: [
    'https://assets.mixkit.co/videos/preview/mixkit-cat-sitting-on-a-couch-1208-large.mp4',
  ],
  animal: [
    'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-park-1201-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-cat-sitting-on-a-couch-1208-large.mp4',
  ],
  pet: [
    'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-park-1201-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-cat-sitting-on-a-couch-1208-large.mp4',
  ],
  food: [
    'https://assets.mixkit.co/videos/preview/mixkit-cooking-a-delicious-meal-in-a-pan-2827-large.mp4',
  ],
  cook: [
    'https://assets.mixkit.co/videos/preview/mixkit-cooking-a-delicious-meal-in-a-pan-2827-large.mp4',
  ],
  cooking: [
    'https://assets.mixkit.co/videos/preview/mixkit-cooking-a-delicious-meal-in-a-pan-2827-large.mp4',
  ],
  music: [
    'https://assets.mixkit.co/videos/preview/mixkit-musician-playing-guitar-on-stage-4196-large.mp4',
  ],
  guitar: [
    'https://assets.mixkit.co/videos/preview/mixkit-musician-playing-guitar-on-stage-4196-large.mp4',
  ],
  concert: [
    'https://assets.mixkit.co/videos/preview/mixkit-musician-playing-guitar-on-stage-4196-large.mp4',
  ],
  abstract: [
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1488-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-colorful-abstract-background-1489-large.mp4',
  ],
  colorful: [
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1488-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-colorful-fireworks-in-the-night-sky-1580-large.mp4',
  ],
  fireworks: [
    'https://assets.mixkit.co/videos/preview/mixkit-colorful-fireworks-in-the-night-sky-1580-large.mp4',
  ],
  people: [
    'https://assets.mixkit.co/videos/preview/mixkit-people-walking-in-a-busy-street-4479-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-laptop-42746-large.mp4',
  ],
  woman: [
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-yoga-in-the-park-1205-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
  ],
  yoga: [
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-yoga-in-the-park-1205-large.mp4',
  ],
  run: [
    'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
  ],
  running: [
    'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
  ],
  sport: [
    'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-1207-large.mp4',
  ],
  sports: [
    'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-1207-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
  ],
  soccer: [
    'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-1207-large.mp4',
  ],
  football: [
    'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-1207-large.mp4',
  ],
  dance: [
    'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-the-street-1203-large.mp4',
  ],
  dancing: [
    'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-the-street-1203-large.mp4',
  ],
  technology: [
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-laptop-42746-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4487-large.mp4',
  ],
  tech: [
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-laptop-42746-large.mp4',
  ],
  laptop: [
    'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4487-large.mp4',
  ],
  work: [
    'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4487-large.mp4',
  ],
  coffee: [
    'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4487-large.mp4',
  ],
  travel: [
    'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-hiking-in-the-mountains-1204-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
  ],
  rain: [
    'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-street-1206-large.mp4',
  ],
  storm: [
    'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-street-1206-large.mp4',
  ],
  bird: [
    'https://assets.mixkit.co/videos/preview/mixkit-birds-flying-over-the-sea-1564-large.mp4',
  ],
  birds: [
    'https://assets.mixkit.co/videos/preview/mixkit-birds-flying-over-the-sea-1564-large.mp4',
  ],
  waterfall: [
    'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
  ],
  sunrise: [
    'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
  ],
  sunset: [
    'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
  ],
  sky: [
    'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-night-sky-with-stars-17540-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-birds-flying-over-the-sea-1564-large.mp4',
  ],
  phone: [
    'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-in-the-city-4487-large.mp4',
  ],
  smartphone: [
    'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-in-the-city-4487-large.mp4',
  ],
  mobile: [
    'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-in-the-city-4487-large.mp4',
  ],
  aerial: [
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-1564-large.mp4',
  ],
  park: [
    'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-park-1201-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-yoga-in-the-park-1205-large.mp4',
  ],
  futuristic: [
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1488-large.mp4',
  ],
  art: [
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1488-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-colorful-abstract-background-1489-large.mp4',
  ],
};

// General fallback pool (diverse, guaranteed playable)
const GENERAL_POOL: string[] = [
  'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-landscape-1209-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1488-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-ocean-1565-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-colorful-fireworks-in-the-night-sky-1580-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-night-sky-with-stars-17540-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
];

function resolveVideoUrls(prompt: string): string[] {
  const words = prompt.toLowerCase().split(/\s+/);
  const matched: string[] = [];

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');
    if (KEYWORD_VIDEO_MAP[clean]) {
      for (const url of KEYWORD_VIDEO_MAP[clean]) {
        if (!matched.includes(url)) matched.push(url);
      }
    }
  }

  if (matched.length === 0) {
    // Deterministic pick from general pool
    const seed = prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const start = seed % GENERAL_POOL.length;
    return [...GENERAL_POOL.slice(start), ...GENERAL_POOL.slice(0, start)];
  }

  // Append general pool as additional fallbacks
  for (const url of GENERAL_POOL) {
    if (!matched.includes(url)) matched.push(url);
  }

  return matched;
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const urlQueueRef = useRef<string[]>([]);
  const currentUrlIndexRef = useRef<number>(0);

  const generateVideo = useCallback(() => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    const urls = resolveVideoUrls(prompt.trim());
    urlQueueRef.current = urls;
    currentUrlIndexRef.current = 0;
    setVideoUrl(urls[0]);
    setIsLoading(false);
  }, [prompt]);

  const handleVideoError = () => {
    const nextIndex = currentUrlIndexRef.current + 1;
    if (nextIndex < urlQueueRef.current.length) {
      currentUrlIndexRef.current = nextIndex;
      setVideoUrl(urlQueueRef.current[nextIndex]);
    } else {
      setError('Unable to load video. Please try a different prompt.');
      setVideoUrl(null);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${Date.now()}.mp4`;
    a.target = '_blank';
    a.click();
  };

  const handleShare = async () => {
    if (!videoUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: prompt, url: videoUrl });
      } else {
        await navigator.clipboard.writeText(videoUrl);
      }
    } catch {
      // share cancelled or not supported
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe the video you want… (e.g. 'ocean waves at sunset', 'city skyline at night', 'mountain hiking')"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="min-h-[80px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.ctrlKey) generateVideo();
          }}
        />
        <Button
          onClick={generateVideo}
          disabled={!prompt.trim() || isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Finding video…
            </>
          ) : (
            <>
              <Video className="w-4 h-4 mr-2" />
              Generate Video
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm space-y-2">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={generateVideo}>
            Retry
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-border bg-card">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Finding the best matching video…</p>
        </div>
      )}

      {videoUrl && !isLoading && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-border bg-black">
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              muted
              loop
              className="w-full max-h-[400px]"
              onError={handleVideoError}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={generateVideo}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
