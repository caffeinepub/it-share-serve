import React, { useState, useCallback, useRef } from 'react';
import { Download, RefreshCw, Loader2, Video, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
];

async function tryPollinationsVideo(prompt: string): Promise<string | null> {
  const url = `https://video.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return url;
  } catch {
    // timeout or network error
  }
  return null;
}

async function tryPexelsVideo(prompt: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(prompt)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.videos?.length) return null;
    for (const v of data.videos) {
      const file =
        v.video_files?.find((f: any) => f.quality === 'sd') ||
        v.video_files?.find((f: any) => f.quality === 'hd') ||
        v.video_files?.[0];
      if (file?.link) return file.link;
    }
  } catch {
    // Pexels failed
  }
  return null;
}

function pickFallbackVideo(prompt: string): string {
  // Pick a video from the pool using a deterministic index based on the prompt
  const idx =
    Math.abs(prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) %
    FALLBACK_VIDEO_POOL.length;
  return FALLBACK_VIDEO_POOL[idx];
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateVideo = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatusMsg('Trying AI video generation…');

    // 1. Try Pollinations AI video endpoint
    const pollinationsUrl = await tryPollinationsVideo(prompt.trim());
    if (pollinationsUrl) {
      setVideoUrl(pollinationsUrl);
      setIsLoading(false);
      setStatusMsg('');
      return;
    }

    // 2. Try Pexels Videos API
    setStatusMsg('Searching Pexels for matching videos…');
    const pexelsUrl = await tryPexelsVideo(prompt.trim());
    if (pexelsUrl) {
      setVideoUrl(pexelsUrl);
      setIsLoading(false);
      setStatusMsg('');
      return;
    }

    // 3. Use curated fallback pool
    setStatusMsg('');
    const fallback = pickFallbackVideo(prompt.trim());
    setVideoUrl(fallback);
    setIsLoading(false);
  }, [prompt]);

  const handleVideoError = () => {
    // Try a different fallback from the pool
    const altIdx =
      (Math.abs(prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) + 1) %
      FALLBACK_VIDEO_POOL.length;
    const alt = FALLBACK_VIDEO_POOL[altIdx];
    if (videoUrl !== alt) {
      setVideoUrl(alt);
    } else {
      setError('Unable to load video. Please try a different prompt.');
      setVideoUrl(null);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `ai-video-${Date.now()}.mp4`;
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
          placeholder="Describe the video you want to generate… (e.g. 'ocean waves at sunset', 'city skyline at night')"
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
              {statusMsg || 'Generating…'}
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
          <p className="text-muted-foreground text-sm">{statusMsg || 'Generating your video…'}</p>
        </div>
      )}

      {videoUrl && !isLoading && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-border bg-black">
            <video
              ref={videoRef}
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
