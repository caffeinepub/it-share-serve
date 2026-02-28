import React, { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle2, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSharePhoto } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import { ExternalBlob } from '../backend';

const SIZE_PRICES: Record<string, number> = {
  sm: 19.99,
  md: 34.99,
  lg: 54.99,
  xl: 79.99,
};

const SIZE_LABELS: Record<string, string> = {
  sm: 'Small (8×10 in)',
  md: 'Medium (12×16 in)',
  lg: 'Large (18×24 in)',
  xl: 'XL Poster (24×36 in)',
};

const FINISH_LABELS: Record<string, string> = {
  matte: 'Matte',
  glossy: 'Glossy',
  canvas: 'Canvas',
  metallic: 'Metallic',
};

const PALETTE_LABELS: Record<string, string> = {
  original: 'Original',
  monochrome: 'Monochrome',
  warm: 'Warm Sunset',
  cool: 'Cool Ocean',
  neon: 'Neon Glow',
  pastel: 'Soft Pastel',
};

interface Customizations {
  colorPalette: string;
  size: string;
  quantity: number;
  customText: string;
  finish: string;
}

export default function PurchaseConfirmationPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { designId?: string };
  const designId = search.designId ?? '';

  const imageUrl = sessionStorage.getItem(`design_image_${designId}`) ?? null;
  const designPrompt = sessionStorage.getItem(`design_prompt_${designId}`) ?? 'AI Generated Design';
  const rawCustomizations = sessionStorage.getItem(`design_customizations_${designId}`);
  const customizations: Customizations = rawCustomizations
    ? JSON.parse(rawCustomizations)
    : { colorPalette: 'original', size: 'md', quantity: 1, customText: '', finish: 'matte' };

  const [isPurchased, setIsPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { username } = useAuth();
  const sharePhoto = useSharePhoto();

  const unitPrice = SIZE_PRICES[customizations.size] ?? 34.99;
  const subtotal = unitPrice * customizations.quantity;
  const shipping = 4.99;
  const total = (subtotal + shipping).toFixed(2);

  const handleCompletePurchase = async () => {
    if (!username || !imageUrl) {
      setError('You must be logged in to complete a purchase.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // Save the design to the user's profile as part of the purchase record
      const blob = ExternalBlob.fromURL(imageUrl);
      await sharePhoto.mutateAsync({ username, blob });

      // Clean up session storage
      sessionStorage.removeItem(`design_image_${designId}`);
      sessionStorage.removeItem(`design_prompt_${designId}`);
      sessionStorage.removeItem(`design_customizations_${designId}`);

      setIsPurchased(true);
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPurchased) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_30px_oklch(0.72_0.2_195/0.4)]">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Purchase Complete!</h1>
          <p className="text-muted-foreground">
            Your customized design has been saved to your profile and your order is confirmed.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 w-full text-left space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Details</p>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size</span>
              <span className="text-foreground">{SIZE_LABELS[customizations.size]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Finish</span>
              <span className="text-foreground">{FINISH_LABELS[customizations.finish]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Palette</span>
              <span className="text-foreground">{PALETTE_LABELS[customizations.colorPalette]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="text-foreground">×{customizations.quantity}</span>
            </div>
            <Separator className="border-border/50 my-2" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">${total}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-accent"
            onClick={() => navigate({ to: '/profile' })}
          >
            View Profile
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate({ to: '/create' })}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: `/customize-design/${designId}` })}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Confirm Purchase</h1>
          <p className="text-sm text-muted-foreground">Review your order before completing</p>
        </div>
      </div>

      {/* Design Preview */}
      <div className="rounded-2xl overflow-hidden border border-primary/20 bg-card shadow-[0_0_20px_oklch(0.72_0.2_195/0.1)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={designPrompt}
            className="w-full object-cover"
            style={{ maxHeight: '280px' }}
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-card">
            <p className="text-muted-foreground text-sm">Design preview unavailable</p>
          </div>
        )}
      </div>

      {/* Customization Summary */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Customizations</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/50 border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Color Palette</p>
            <p className="text-sm font-medium text-foreground">{PALETTE_LABELS[customizations.colorPalette]}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Print Size</p>
            <p className="text-sm font-medium text-foreground">{SIZE_LABELS[customizations.size]}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Finish</p>
            <p className="text-sm font-medium text-foreground">{FINISH_LABELS[customizations.finish]}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="text-sm font-medium text-foreground">×{customizations.quantity}</p>
          </div>
        </div>
        {customizations.customText && (
          <div className="rounded-xl bg-secondary/50 border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Custom Text</p>
            <p className="text-sm font-medium text-foreground">"{customizations.customText}"</p>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Price Breakdown</h2>
        <Separator className="border-border/50" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Unit Price ({SIZE_LABELS[customizations.size]})</span>
            <span className="text-foreground">${unitPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Quantity</span>
            <span className="text-foreground">×{customizations.quantity}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-foreground">${shipping.toFixed(2)}</span>
          </div>
        </div>
        <Separator className="border-border/50" />
        <div className="flex justify-between font-bold text-lg">
          <span className="text-foreground">Total</span>
          <span className="text-primary shadow-[0_0_8px_oklch(0.72_0.2_195/0.5)]">${total}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Complete Purchase Button */}
      <Button
        onClick={handleCompletePurchase}
        disabled={isProcessing}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base font-bold shadow-[0_0_20px_oklch(0.72_0.2_195/0.5)]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5 mr-2" />
            Complete Purchase — ${total}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By completing your purchase, your design will be saved to your profile.
      </p>
    </div>
  );
}
