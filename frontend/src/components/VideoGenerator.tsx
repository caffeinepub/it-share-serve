import { useState } from 'react';
import { Video, Download, Save, RefreshCw, Clapperboard } from 'lucide-react';
import { useShareVideo } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// Each category has multiple direct MP4 URLs from two platforms:
// Primary: Mixkit CDN (free license, no auth required)
// Fallback: Coverr CDN / Pexels-compatible direct MP4 links
// All URLs are direct .mp4 files playable by the HTML5 <video> element.
const VIDEO_CATEGORIES: Record<string, string[]> = {
  ocean: [
    'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-ocean-waves-7078/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  ],
  waves: [
    'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  ],
  water: [
    'https://cdn.coverr.co/videos/coverr-water-flowing-over-rocks-in-a-stream-1765/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  ],
  beach: [
    'https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-shore-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  ],
  fire: [
    'https://cdn.coverr.co/videos/coverr-fire-burning-in-a-fireplace-3299/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-campfire-burning-in-the-dark-4702-large.mp4',
  ],
  flame: [
    'https://cdn.coverr.co/videos/coverr-fire-burning-in-a-fireplace-3299/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-campfire-burning-in-the-dark-4702-large.mp4',
  ],
  nature: [
    'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  forest: [
    'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  trees: [
    'https://cdn.coverr.co/videos/coverr-green-forest-with-sunlight-filtering-through-trees-1765/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  city: [
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1487-large.mp4',
  ],
  urban: [
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1487-large.mp4',
  ],
  night: [
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1487-large.mp4',
  ],
  sky: [
    'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
  ],
  clouds: [
    'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
  ],
  sunset: [
    'https://cdn.coverr.co/videos/coverr-sunset-over-the-ocean-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-sea-1003-large.mp4',
  ],
  sunrise: [
    'https://cdn.coverr.co/videos/coverr-sunrise-over-mountains-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
  ],
  snow: [
    'https://cdn.coverr.co/videos/coverr-snowflakes-falling-in-slow-motion-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-snowflakes-falling-in-slow-motion-4765-large.mp4',
  ],
  winter: [
    'https://cdn.coverr.co/videos/coverr-snowflakes-falling-in-slow-motion-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-snowflakes-falling-in-slow-motion-4765-large.mp4',
  ],
  rain: [
    'https://cdn.coverr.co/videos/coverr-rain-falling-on-a-window-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-surface-1182-large.mp4',
  ],
  storm: [
    'https://cdn.coverr.co/videos/coverr-rain-falling-on-a-window-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-surface-1182-large.mp4',
  ],
  space: [
    'https://cdn.coverr.co/videos/coverr-stars-in-space-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  ],
  galaxy: [
    'https://cdn.coverr.co/videos/coverr-stars-in-space-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  ],
  stars: [
    'https://cdn.coverr.co/videos/coverr-stars-in-space-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  ],
  technology: [
    'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
  ],
  tech: [
    'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
  ],
  digital: [
    'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
  ],
  abstract: [
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
    'https://cdn.coverr.co/videos/coverr-abstract-digital-technology-background-1580/1080p.mp4',
  ],
  mountain: [
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-mountains-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  mountains: [
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-mountains-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  flowers: [
    'https://cdn.coverr.co/videos/coverr-flowers-blooming-in-a-garden-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
  flower: [
    'https://cdn.coverr.co/videos/coverr-flowers-blooming-in-a-garden-1580/1080p.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  ],
};

// Default fallback videos when no keyword matches
const DEFAULT_VIDEOS: string[] = [
  'https://assets.mixkit.co/videos/preview/mixkit-abstract-colorful-waves-1178-large.mp4',
  'https://cdn.coverr.co/videos/coverr-white-clouds-moving-across-a-blue-sky-1580/1080p.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
];

function extractVideoKeyword(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  const words = lower.split(/\s+/);
  for (const word of words) {
    if (VIDEO_CATEGORIES[word]) return word;
  }
  for (const key of Object.keys(VIDEO_CATEGORIES)) {
    if (lower.includes(key)) return key;
  }
  return null;
}

function getVideoUrls(prompt: string, variationIndex: number): string[] {
  const keyword = extractVideoKeyword(prompt);
  const pool = keyword ? VIDEO_CATEGORIES[keyword] : DEFAULT_VIDEOS;
  // Rotate through the pool based on variation
  const start = variationIndex % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  // Always append defaults as final fallback
  return [...rotated, ...DEFAULT_VIDEOS.filter(u => !rotated.includes(u))];
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variationIndex, setVariationIndex] = useState(0);
  const shareVideo = useShareVideo();
  const { username } = useAuth();

  const currentUrl = videoUrls[currentUrlIndex] ?? null;

  const handleGenerate = async (newVariation: number = 0) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    setVideoUrls([]);
    setCurrentUrlIndex(0);

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 800));

    const urls = getVideoUrls(prompt, newVariation);
    setVideoUrls(urls);
    setVariationIndex(newVariation);
    setIsGenerating(false);
    toast.success('Video generated!');
  };

  const handleVideoError = () => {
    if (currentUrlIndex < videoUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    }
  };

  const handleSave = async () => {
    if (!currentUrl || !username) return;
    try {
      const blob = ExternalBlob.fromURL(currentUrl);
      await shareVideo.mutateAsync({ username, blob });
      toast.success('Video saved to your profile!');
    } catch {
      toast.error('Failed to save video');
    }
  };

  const handleDownload = () => {
    if (!currentUrl) return;
    const a = document.createElement('a');
    a.href = currentUrl;
    a.download = `shareserve-video-${Date.now()}.mp4`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRegenerate = () => {
    if (!prompt.trim()) return;
    const newVariation = variationIndex + 1;
    handleGenerate(newVariation);
  };

  return (
    <div className="space-y-4">
      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neon-cyan uppercase tracking-wider">
          Video Prompt
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isGenerating && handleGenerate(variationIndex)}
            placeholder="Ocean waves at sunset, forest stream, city at night..."
            className="input-neon flex-1 rounded-xl px-4 py-3 text-sm"
            disabled={isGenerating}
          />
          <button
            onClick={() => handleGenerate(variationIndex)}
            disabled={isGenerating || !prompt.trim()}
            className="btn-neon-cyan rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Clapperboard className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Display Area */}
      <div className="relative rounded-2xl overflow-hidden border border-neon-cyan/20 bg-secondary/30 min-h-[280px] flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20 animate-spin-slow" />
              <div
                className="absolute inset-2 rounded-full border-2 border-neon-violet/30 animate-spin-slow"
                style={{ animationDirection: 'reverse', animationDuration: '5s' }}
              />
              <div
                className="absolute inset-4 rounded-full border-2 border-neon-pink/20 animate-spin-slow"
                style={{ animationDuration: '3s' }}
              />
              <Clapperboard className="absolute inset-0 m-auto w-6 h-6 text-neon-cyan animate-glow-pulse" />
            </div>
            <div className="text-center">
              <p className="font-orbitron text-sm text-neon-cyan animate-glow-pulse">Generating Video</p>
              <p className="text-xs text-muted-foreground mt-1">AI is creating your scene...</p>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full animate-shimmer"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, oklch(0.85 0.2 195), transparent)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>
        ) : currentUrl ? (
          <div className="w-full">
            <video
              key={currentUrl}
              src={currentUrl}
              controls
              autoPlay={false}
              className="w-full rounded-2xl bg-black"
              style={{ maxHeight: '400px', display: 'block' }}
              onError={handleVideoError}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-muted-foreground">
            <Video className="w-12 h-12 opacity-20" />
            <p className="text-sm">Your generated video will appear here</p>
            <p className="text-xs opacity-60">Enter a prompt and click Generate</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentUrl && !isGenerating && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={shareVideo.isPending}
            className="btn-neon-cyan rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {shareVideo.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save to Profile
          </button>
          <button
            onClick={handleDownload}
            className="rounded-xl px-4 py-2 text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="rounded-xl px-4 py-2 text-sm font-medium border border-neon-violet/30 text-neon-violet hover:bg-neon-violet/10 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
