import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { Download, Save, RefreshCw, Loader2, ImageIcon, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useSharePhoto } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';

export interface ImageGeneratorHandle {
  setPrompt: (text: string) => void;
}

// Source 1: Pollinations AI
function buildPollinationsUrl(prompt: string, seed: number): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=800&height=600&nologo=true`;
}

// Source 2: Picsum Photos (deterministic, prompt-influenced)
function buildPicsumUrl(prompt: string, seed: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}-${seed}/800/600`;
}

// Source 3: Unsplash (keyword-based)
function buildUnsplashUrl(prompt: string): string {
  const keyword = prompt.trim().split(/\s+/).find(w => w.length > 3) || prompt.trim().split(/\s+/)[0] || 'nature';
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}`;
}

type Source = 'pollinations' | 'picsum' | 'unsplash';

const SOURCE_ORDER: Source[] = ['pollinations', 'picsum', 'unsplash'];

const ImageGenerator = forwardRef<ImageGeneratorHandle>((_, ref) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<Source>('pollinations');
  const [isSaving, setIsSaving] = useState(false);
  const seedRef = useRef<number>(1);
  const { username } = useAuth();
  const sharePhoto = useSharePhoto();
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    setPrompt: (text: string) => setPrompt(text),
  }));

  const getUrlForSource = useCallback(
    (source: Source, seed: number): string => {
      switch (source) {
        case 'pollinations':
          return buildPollinationsUrl(prompt, seed);
        case 'picsum':
          return buildPicsumUrl(prompt, seed);
        case 'unsplash':
          return buildUnsplashUrl(prompt);
      }
    },
    [prompt]
  );

  const startGeneration = useCallback(
    (newSeed?: number) => {
      if (!prompt.trim()) return;
      const seed = newSeed ?? Math.floor(Math.random() * 1_000_000) + 1;
      seedRef.current = seed;
      setCurrentSource('pollinations');
      setIsLoading(true);
      setError(null);
      setImageUrl(buildPollinationsUrl(prompt, seed));
    },
    [prompt]
  );

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    const currentIdx = SOURCE_ORDER.indexOf(currentSource);
    const nextIdx = currentIdx + 1;
    if (nextIdx < SOURCE_ORDER.length) {
      const nextSource = SOURCE_ORDER[nextIdx];
      setCurrentSource(nextSource);
      setImageUrl(getUrlForSource(nextSource, seedRef.current));
    } else {
      setIsLoading(false);
      setError(
        'Could not generate an image — please try a different prompt or try again later.'
      );
      setImageUrl(null);
    }
  };

  const handleRegenerate = () => {
    startGeneration();
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const handleSave = async () => {
    if (!imageUrl || !username) return;
    setIsSaving(true);
    try {
      const blob = ExternalBlob.fromURL(imageUrl);
      await sharePhoto.mutateAsync({ username, blob });
    } catch {
      setError('Failed to save image to profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuyDesign = () => {
    if (!imageUrl) return;
    // Generate a unique design ID for this session
    const designId = `design_${Date.now()}`;
    // Store the image URL and prompt in sessionStorage for the customize page
    sessionStorage.setItem(`design_image_${designId}`, imageUrl);
    sessionStorage.setItem(`design_prompt_${designId}`, prompt || 'AI Generated Design');
    navigate({ to: `/customize-design/${designId}` });
  };

  const sourceLabel: Record<Source, string> = {
    pollinations: 'AI model',
    picsum: 'photo library',
    unsplash: 'Unsplash',
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe the image you want to generate... (e.g. 'a futuristic city at sunset with neon lights')"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="min-h-[80px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.ctrlKey) startGeneration();
          }}
        />
        <Button
          onClick={() => startGeneration()}
          disabled={!prompt.trim() || isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentSource !== 'pollinations'
                ? `Trying ${sourceLabel[currentSource]}…`
                : 'Generating…'}
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm space-y-2">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => startGeneration()}
          >
            Try Again
          </Button>
        </div>
      )}

      {(imageUrl || isLoading) && !error && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-card">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 z-10 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {currentSource !== 'pollinations'
                  ? `Trying ${sourceLabel[currentSource]}…`
                  : 'Generating your image…'}
              </p>
            </div>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={prompt}
              className="w-full object-cover"
              style={{ minHeight: '300px', maxHeight: '500px' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      )}

      {imageUrl && !isLoading && !error && (
        <div className="space-y-2">
          {/* Buy Design - primary action */}
          <Button
            onClick={handleBuyDesign}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_14px_oklch(0.72_0.2_195/0.4)]"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy This Design
          </Button>

          {/* Secondary actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
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
            {username && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 border-border text-foreground hover:bg-accent"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving…' : 'Save to Profile'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

ImageGenerator.displayName = 'ImageGenerator';

export default ImageGenerator;
