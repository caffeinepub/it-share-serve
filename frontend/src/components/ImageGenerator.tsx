import React, { useState, useCallback, useRef } from 'react';
import { Download, Save, RefreshCw, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../hooks/useAuth';
import { useSharePhoto } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';

const MAX_RETRIES = 3;

function buildPollinationsUrl(prompt: string, seed: number): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=800&height=600&nologo=true&model=flux`;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const seedRef = useRef<number>(1);
  const { username } = useAuth();
  const sharePhoto = useSharePhoto();

  const startGeneration = useCallback(
    (baseSeed?: number) => {
      if (!prompt.trim()) return;
      const seed = baseSeed ?? Math.floor(Math.random() * 1_000_000) + 1;
      seedRef.current = seed;
      setRetryCount(0);
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
    const nextRetry = retryCount + 1;
    if (nextRetry <= MAX_RETRIES) {
      const newSeed = seedRef.current + nextRetry * 1000;
      seedRef.current = newSeed;
      setRetryCount(nextRetry);
      setImageUrl(buildPollinationsUrl(prompt, newSeed));
    } else {
      setIsLoading(false);
      setError(
        'Could not generate an image after several attempts. Please try a different prompt or try again later.'
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
              {retryCount > 0 ? `Retrying… (${retryCount}/${MAX_RETRIES})` : 'Generating…'}
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
                {retryCount > 0
                  ? `Retrying… attempt ${retryCount + 1} of ${MAX_RETRIES + 1}`
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
      )}
    </div>
  );
}
