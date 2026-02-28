import { useState } from 'react';
import { Sparkles, Download, Save, RefreshCw, Image } from 'lucide-react';
import { useSharePhoto } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// Curated placeholder images for different prompt themes
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
  'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const sharePhoto = useSharePhoto();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    setGeneratedUrl(null);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    // Pick a placeholder based on prompt content
    const idx = prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % PLACEHOLDER_IMAGES.length;
    setGeneratedUrl(PLACEHOLDER_IMAGES[idx]);
    setIsGenerating(false);
    toast.success('Image generated!');
  };

  const handleSave = async () => {
    if (!generatedUrl) return;
    try {
      const blob = ExternalBlob.fromURL(generatedUrl);
      await sharePhoto.mutateAsync(blob);
      toast.success('Image saved to your profile!');
    } catch {
      toast.error('Failed to save image');
    }
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const a = document.createElement('a');
    a.href = generatedUrl;
    a.download = `shareserve-image-${Date.now()}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRegenerate = () => {
    if (!prompt.trim()) return;
    setGeneratedUrl(null);
    handleGenerate();
  };

  return (
    <div className="space-y-4">
      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neon-violet uppercase tracking-wider">
          Image Prompt
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isGenerating && handleGenerate()}
            placeholder="A futuristic city at night with neon lights..."
            className="input-neon flex-1 rounded-xl px-4 py-3 text-sm"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-neon-violet rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generation Area */}
      <div className="relative rounded-2xl overflow-hidden border border-neon-violet/20 bg-secondary/30 min-h-[280px] flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 p-8">
            {/* Animated generation indicator */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-neon-violet/20 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-neon-cyan/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '5s' }} />
              <div className="absolute inset-4 rounded-full border-2 border-neon-pink/20 animate-spin-slow" style={{ animationDuration: '3s' }} />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-neon-violet animate-glow-pulse" />
            </div>
            <div className="text-center">
              <p className="font-orbitron text-sm text-neon-violet animate-glow-pulse">Generating Image</p>
              <p className="text-xs text-muted-foreground mt-1">AI is creating your vision...</p>
            </div>
            {/* Shimmer bar */}
            <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.72 0.25 290), transparent)', backgroundSize: '200% 100%' }} />
            </div>
          </div>
        ) : generatedUrl ? (
          <div className="w-full">
            <img
              src={generatedUrl}
              alt="Generated"
              className="w-full object-cover rounded-2xl"
              style={{ maxHeight: '400px' }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-muted-foreground">
            <Image className="w-12 h-12 opacity-20" />
            <p className="text-sm">Your generated image will appear here</p>
            <p className="text-xs opacity-60">Enter a prompt and click Generate</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {generatedUrl && !isGenerating && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={sharePhoto.isPending}
            className="btn-neon-violet rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {sharePhoto.isPending ? (
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
            className="rounded-xl px-4 py-2 text-sm font-medium border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
