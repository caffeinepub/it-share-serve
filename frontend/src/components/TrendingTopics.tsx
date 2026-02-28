import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Hash } from 'lucide-react';

const TRENDING_TAGS = [
  { tag: 'AIArt', color: 'var(--neon-cyan)' },
  { tag: 'Photography', color: 'var(--neon-violet)' },
  { tag: 'DigitalArt', color: 'var(--neon-pink)' },
  { tag: 'VideoCreation', color: 'var(--neon-green)' },
  { tag: 'Web3', color: 'var(--neon-yellow)' },
  { tag: 'NFT', color: 'var(--neon-cyan)' },
  { tag: 'Crypto', color: 'var(--neon-violet)' },
  { tag: 'Design', color: 'var(--neon-pink)' },
  { tag: 'Animation', color: 'var(--neon-green)' },
  { tag: 'Music', color: 'var(--neon-yellow)' },
];

export default function TrendingTopics() {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate({
      to: '/search',
      state: { topic: tag } as any,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TRENDING_TAGS.map(({ tag, color }) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border"
          style={{
            borderColor: `${color}40`,
            color: color,
            background: `${color}10`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${color}20`;
            e.currentTarget.style.boxShadow = `0 0 10px ${color}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${color}10`;
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <Hash size={12} />
          {tag}
        </button>
      ))}
    </div>
  );
}
