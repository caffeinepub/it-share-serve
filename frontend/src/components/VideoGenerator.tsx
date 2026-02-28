import { useState } from 'react';
import { Video, Download, Save, RefreshCw, Clapperboard } from 'lucide-react';
import { useShareVideo } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// Curated placeholder video thumbnails (using images as video placeholders)
const PLACEHOLDER_VIDEOS = [
  {
    thumb: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
    label: 'Space Journey',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    label: 'Tech Pulse',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    label: 'Ocean Waves',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    label: 'City Lights',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80',
    label: 'Cosmic Dream',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    label: 'Mountain Peak',
  },
];

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedThumb, setGeneratedThumb] = useState<string | null>(null);
  const [generatedLabel, setGeneratedLabel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const shareVideo = useShareVideo();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    setGeneratedThumb(null);
    setProgress(0);

    // Simulate video generation with progress
    const totalTime = 3000 + Math.random() * 2000;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 8;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, totalTime));
    clearInterval(interval);
    setProgress(100);

    const idx = prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % PLACEHOLDER_VIDEOS.length;
    setGeneratedThumb(PLACEHOLDER_VIDEOS[idx].thumb);
    setGeneratedLabel(PLACEHOLDER_VIDEOS[idx].label);
    setIsGenerating(false);
    toast.success('Video generated!');
  };

  const handleSave = async () => {
    if (!generatedThumb) return;
    try {
      // Save the thumbnail as a video placeholder
      const blob = ExternalBlob.fromURL(generatedThumb);
      await shareVideo.mutateAsync(blob);
      toast.success('Video saved to your profile!');
    } catch {
      toast.error('Failed to save video');
    }
  };

  const handleDownload = () => {
    if (!generatedThumb) return;
    const a = document.createElement('a');
    a.href = generatedThumb;
    a.download = `shareserve-video-${Date.now()}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRegenerate = () => {
    if (!prompt.trim()) return;
    setGeneratedThumb(null);
    setProgress(0);
    handleGenerate();
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
            onKeyDown={e => e.key === 'Enter' && !isGenerating && handleGenerate()}
            placeholder="A timelapse of a city transforming at sunset..."
            className="input-neon flex-1 rounded-xl px-4 py-3 text-sm"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-neon-cyan rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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

      {/* Generation Area */}
      <div className="relative rounded-2xl overflow-hidden border border-neon-cyan/20 bg-secondary/30 min-h-[280px] flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 p-8 w-full">
            {/* Animated video generation indicator */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-neon-violet/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '5s' }} />
              <div className="absolute inset-4 rounded-full border-2 border-neon-pink/20 animate-spin-slow" style={{ animationDuration: '3s' }} />
              <Video className="absolute inset-0 m-auto w-6 h-6 text-neon-cyan animate-glow-pulse" />
            </div>
            <div className="text-center">
              <p className="font-orbitron text-sm text-neon-cyan animate-glow-pulse">Generating Video</p>
              <p className="text-xs text-muted-foreground mt-1">Rendering frames...</p>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, oklch(0.75 0.2 195), oklch(0.72 0.25 290))',
                  }}
                />
              </div>
            </div>
          </div>
        ) : generatedThumb ? (
          <div className="w-full relative group">
            <img
              src={generatedThumb}
              alt="Generated video preview"
              className="w-full object-cover rounded-2xl"
              style={{ maxHeight: '400px' }}
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan/60 flex items-center justify-center backdrop-blur-sm">
                <Video className="w-7 h-7 text-neon-cyan ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <p className="text-xs font-orbitron text-neon-cyan">{generatedLabel}</p>
              <p className="text-xs text-muted-foreground">AI Generated · 5s clip</p>
            </div>
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
      {generatedThumb && !isGenerating && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={shareVideo.isPending}
            className="btn-neon-cyan rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {shareVideo.isPending ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
