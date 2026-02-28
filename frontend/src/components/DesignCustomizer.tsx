import React, { useState } from 'react';
import { Palette, Ruler, Hash, Type, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export interface DesignCustomizations {
  colorPalette: string;
  size: string;
  quantity: number;
  customText: string;
  finish: string;
}

interface DesignCustomizerProps {
  onCustomizationsChange: (customizations: DesignCustomizations) => void;
  customizations: DesignCustomizations;
}

const COLOR_PALETTES = [
  { id: 'original', label: 'Original', colors: ['#00d4ff', '#7c3aed', '#ec4899'] },
  { id: 'monochrome', label: 'Monochrome', colors: ['#ffffff', '#888888', '#222222'] },
  { id: 'warm', label: 'Warm Sunset', colors: ['#ff6b35', '#f7c59f', '#ffe66d'] },
  { id: 'cool', label: 'Cool Ocean', colors: ['#0077b6', '#00b4d8', '#90e0ef'] },
  { id: 'neon', label: 'Neon Glow', colors: ['#39ff14', '#ff073a', '#0ff0fc'] },
  { id: 'pastel', label: 'Soft Pastel', colors: ['#ffd6e0', '#c8e6c9', '#bbdefb'] },
];

const SIZES = [
  { id: 'sm', label: 'Small', desc: '8×10 in' },
  { id: 'md', label: 'Medium', desc: '12×16 in' },
  { id: 'lg', label: 'Large', desc: '18×24 in' },
  { id: 'xl', label: 'XL Poster', desc: '24×36 in' },
];

const FINISHES = [
  { id: 'matte', label: 'Matte' },
  { id: 'glossy', label: 'Glossy' },
  { id: 'canvas', label: 'Canvas' },
  { id: 'metallic', label: 'Metallic' },
];

export default function DesignCustomizer({ onCustomizationsChange, customizations }: DesignCustomizerProps) {
  const update = (partial: Partial<DesignCustomizations>) => {
    onCustomizationsChange({ ...customizations, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">Color Palette</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => update({ colorPalette: palette.id })}
              className={`relative flex flex-col items-start gap-2 p-3 rounded-xl border transition-all ${
                customizations.colorPalette === palette.id
                  ? 'border-primary bg-primary/10 shadow-[0_0_10px_oklch(0.72_0.2_195/0.3)]'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
              }`}
            >
              {customizations.colorPalette === palette.id && (
                <span className="absolute top-2 right-2">
                  <Check className="w-3 h-3 text-primary" />
                </span>
              )}
              <div className="flex gap-1">
                {palette.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-xs text-foreground font-medium">{palette.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">Print Size</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => update({ size: size.id })}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                customizations.size === size.id
                  ? 'border-primary bg-primary/10 shadow-[0_0_10px_oklch(0.72_0.2_195/0.3)]'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
              }`}
            >
              <span className="text-sm font-semibold text-foreground">{size.label}</span>
              <span className="text-xs text-muted-foreground">{size.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Finish */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <Label className="text-sm font-semibold text-foreground">Finish</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FINISHES.map((finish) => (
            <button
              key={finish.id}
              onClick={() => update({ finish: finish.id })}
              className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
                customizations.finish === finish.id
                  ? 'border-cyan-400/70 bg-cyan-400/10 shadow-[0_0_10px_oklch(0.78_0.18_195/0.25)]'
                  : 'border-border bg-card hover:border-cyan-400/40 hover:bg-accent'
              }`}
            >
              <span className={`text-sm font-medium ${customizations.finish === finish.id ? 'text-cyan-400' : 'text-foreground'}`}>
                {finish.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">
            Quantity: <span className="text-primary">{customizations.quantity}</span>
          </Label>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[customizations.quantity]}
          onValueChange={([val]) => update({ quantity: val })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Custom Text */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">Custom Text (optional)</Label>
        </div>
        <Input
          placeholder="Add a personal message or caption..."
          value={customizations.customText}
          onChange={(e) => update({ customText: e.target.value })}
          maxLength={80}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground text-right">{customizations.customText.length}/80</p>
      </div>
    </div>
  );
}
