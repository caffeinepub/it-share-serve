import React, { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DesignCustomizer, { type DesignCustomizations } from '../components/DesignCustomizer';

const SIZE_PRICES: Record<string, number> = {
  sm: 19.99,
  md: 34.99,
  lg: 54.99,
  xl: 79.99,
};

const FINISH_LABELS: Record<string, string> = {
  matte: 'Matte',
  glossy: 'Glossy',
  canvas: 'Canvas',
  metallic: 'Metallic',
};

const SIZE_LABELS: Record<string, string> = {
  sm: 'Small (8×10 in)',
  md: 'Medium (12×16 in)',
  lg: 'Large (18×24 in)',
  xl: 'XL Poster (24×36 in)',
};

const PALETTE_LABELS: Record<string, string> = {
  original: 'Original',
  monochrome: 'Monochrome',
  warm: 'Warm Sunset',
  cool: 'Cool Ocean',
  neon: 'Neon Glow',
  pastel: 'Soft Pastel',
};

const DEFAULT_CUSTOMIZATIONS: DesignCustomizations = {
  colorPalette: 'original',
  size: 'md',
  quantity: 1,
  customText: '',
  finish: 'matte',
};

export default function CustomizeDesignPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { designId?: string };
  const designId = params.designId ?? '';

  // Recover the image URL from sessionStorage (set by ImageGenerator before navigating)
  const imageUrl = sessionStorage.getItem(`design_image_${designId}`) ?? null;
  const designPrompt = sessionStorage.getItem(`design_prompt_${designId}`) ?? 'AI Generated Design';

  const [customizations, setCustomizations] = useState<DesignCustomizations>(DEFAULT_CUSTOMIZATIONS);

  const unitPrice = SIZE_PRICES[customizations.size] ?? 34.99;
  const total = (unitPrice * customizations.quantity).toFixed(2);

  const handleContinue = () => {
    // Store customizations in sessionStorage for the confirmation page
    sessionStorage.setItem(`design_customizations_${designId}`, JSON.stringify(customizations));
    navigate({
      to: '/purchase-confirmation',
      search: { designId },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/create' })}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customize Your Design</h1>
          <p className="text-sm text-muted-foreground">Choose your options before purchasing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Design Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-primary/20 bg-card shadow-[0_0_20px_oklch(0.72_0.2_195/0.1)]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={designPrompt}
                className="w-full object-cover"
                style={{ maxHeight: '320px' }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-card">
                <p className="text-muted-foreground text-sm">Design preview unavailable</p>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Design Prompt</p>
            <p className="text-sm text-foreground line-clamp-3">{designPrompt}</p>
          </div>

          {/* Order Summary (desktop) */}
          <div className="hidden md:block rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Order Summary</p>
            <Separator className="border-border/50" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Size</span>
                <span className="text-foreground">{SIZE_LABELS[customizations.size]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Finish</span>
                <span className="text-foreground">{FINISH_LABELS[customizations.finish]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Color Palette</span>
                <span className="text-foreground">{PALETTE_LABELS[customizations.colorPalette]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Quantity</span>
                <span className="text-foreground">×{customizations.quantity}</span>
              </div>
              {customizations.customText && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Custom Text</span>
                  <span className="text-foreground truncate max-w-[140px]">"{customizations.customText}"</span>
                </div>
              )}
            </div>
            <Separator className="border-border/50" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-lg">${total}</span>
            </div>
          </div>
        </div>

        {/* Right: Customizer */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <DesignCustomizer
              customizations={customizations}
              onCustomizationsChange={setCustomizations}
            />
          </div>

          {/* Order Summary (mobile) */}
          <div className="md:hidden rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Order Summary</p>
            <Separator className="border-border/50" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Size</span>
                <span className="text-foreground">{SIZE_LABELS[customizations.size]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Finish</span>
                <span className="text-foreground">{FINISH_LABELS[customizations.finish]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Color Palette</span>
                <span className="text-foreground">{PALETTE_LABELS[customizations.colorPalette]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Quantity</span>
                <span className="text-foreground">×{customizations.quantity}</span>
              </div>
            </div>
            <Separator className="border-border/50" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-lg">${total}</span>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold shadow-[0_0_16px_oklch(0.72_0.2_195/0.4)]"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Continue to Purchase
          </Button>
        </div>
      </div>
    </div>
  );
}
