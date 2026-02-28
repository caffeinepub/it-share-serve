import React, { useState, useEffect } from 'react';
import { Search, Image, Video } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

const PICSUM_PHOTOS = Array.from({ length: 20 }, (_, i) => `https://picsum.photos/seed/${i + 10}/400/400`);
const MIXKIT_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-18312-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-sea-1617-large.mp4',
];

type Tab = 'photos' | 'videos';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const state = window.history.state;
    if (state?.topic) {
      setQuery(state.topic);
    }
  }, []);

  const filteredPhotos = query
    ? PICSUM_PHOTOS.filter((_, i) => i % 3 !== 0)
    : PICSUM_PHOTOS;

  const filteredVideos = query
    ? MIXKIT_VIDEOS.filter((_, i) => i % 2 === 0)
    : MIXKIT_VIDEOS;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos, videos, topics..."
            className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
            onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
            onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-secondary/30 rounded-xl p-1">
          {[
            { id: 'photos' as Tab, label: 'Photos', icon: Image },
            { id: 'videos' as Tab, label: 'Videos', icon: Video },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={isActive ? { color: 'var(--neon-cyan)' } : {}}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'photos' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredPhotos.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightboxSrc(src)}
                className="aspect-square rounded-xl overflow-hidden border border-border/30 hover:border-primary/50 transition-all duration-200 group"
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 12px var(--neon-cyan)40'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
              >
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i + 50}/400/400`; }}
                />
              </button>
            ))}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredVideos.map((src, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-border/30 hover:border-primary/50 transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 12px var(--neon-violet)40'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
              >
                <video
                  src={src}
                  controls
                  className="w-full aspect-video object-cover"
                  preload="metadata"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Full size"
            className="max-w-full max-h-full rounded-2xl object-contain"
            style={{ boxShadow: '0 0 40px var(--neon-cyan)30' }}
          />
        </div>
      )}
    </div>
  );
}
