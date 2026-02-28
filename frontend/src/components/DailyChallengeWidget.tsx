import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import AnimatedHeading from './AnimatedHeading';

const DAILY_PROMPTS = [
  'A futuristic city at night with neon lights reflecting on rain-soaked streets',
  'An astronaut discovering an alien garden on a distant planet',
  'A cyberpunk marketplace with holographic advertisements',
  'A mystical forest where the trees glow with bioluminescent light',
  'A steampunk airship sailing through clouds at sunset',
  'An underwater city with glass domes and colorful sea life',
  'A robot artist painting a masterpiece in a neon-lit studio',
  'A time traveler standing at the crossroads of past and future',
  'A dragon made of crystal soaring over a mountain range',
  'A portal opening to a parallel universe in a city park',
  'A space station orbiting a gas giant with colorful rings',
  'A wizard casting spells in a modern urban environment',
  'A mermaid exploring a sunken ancient civilization',
  'A phoenix rising from digital flames in cyberspace',
];

interface DailyChallengeWidgetProps {
  onUsePrompt: (prompt: string) => void;
}

export default function DailyChallengeWidget({ onUsePrompt }: DailyChallengeWidgetProps) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayPrompt = DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];

  return (
    <div
      className="rounded-2xl p-4 border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--neon-cyan)08, var(--neon-violet)08)',
        borderColor: 'var(--neon-cyan)30',
        boxShadow: '0 0 20px var(--neon-cyan)10',
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: 'var(--neon-cyan)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: 'var(--neon-yellow)' }} />
          <AnimatedHeading
            text="Daily Challenge"
            variant="shimmer"
            className="text-sm font-orbitron font-semibold"
          />
        </div>
        <p className="text-foreground/80 text-sm mb-3 leading-relaxed">{todayPrompt}</p>
        <button
          onClick={() => onUsePrompt(todayPrompt)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
            color: 'var(--background)',
            boxShadow: '0 0 12px var(--neon-cyan)40',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px var(--neon-cyan)60'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 12px var(--neon-cyan)40'; }}
        >
          <Zap size={14} />
          Use This Prompt
        </button>
      </div>
    </div>
  );
}
