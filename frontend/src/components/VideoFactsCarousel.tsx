import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const VIDEO_FACTS = [
  {
    id: 1,
    fact: "The observable universe contains an estimated 2 trillion galaxies, each with hundreds of billions of stars.",
    category: "Space",
    color: "from-violet-900/80 to-indigo-900/80",
    accent: "text-neon-violet",
  },
  {
    id: 2,
    fact: "Light from the Sun takes approximately 8 minutes and 20 seconds to reach Earth, traveling at 299,792 km/s.",
    category: "Physics",
    color: "from-cyan-900/80 to-blue-900/80",
    accent: "text-neon-cyan",
  },
  {
    id: 3,
    fact: "DNA is so tightly packed that if you unraveled all the DNA in your body, it would stretch to Pluto and back — 17 times.",
    category: "Biology",
    color: "from-pink-900/80 to-rose-900/80",
    accent: "text-neon-pink",
  },
  {
    id: 4,
    fact: "The Great Wall of China is not visible from space with the naked eye — it's a common myth. Astronauts have confirmed this.",
    category: "History",
    color: "from-emerald-900/80 to-teal-900/80",
    accent: "text-neon-green",
  },
  {
    id: 5,
    fact: "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible.",
    category: "Science",
    color: "from-amber-900/80 to-orange-900/80",
    accent: "text-yellow-400",
  },
  {
    id: 6,
    fact: "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.",
    category: "Astronomy",
    color: "from-violet-900/80 to-purple-900/80",
    accent: "text-neon-violet",
  },
];

export default function VideoFactsCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const goNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(prev => (prev + 1) % VIDEO_FACTS.length);
      setIsAnimating(false);
    }, 300);
  };

  const goPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(prev => (prev - 1 + VIDEO_FACTS.length) % VIDEO_FACTS.length);
      setIsAnimating(false);
    }, 300);
  };

  const fact = VIDEO_FACTS[current];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-neon-violet/20 animate-neon-border">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/video-facts-bg.dim_800x450.png"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${fact.color}`} />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      {/* Content */}
      <div className={`relative p-8 min-h-[220px] flex flex-col justify-between transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className={`w-4 h-4 ${fact.accent}`} />
          <span className={`text-xs font-orbitron font-semibold uppercase tracking-widest ${fact.accent}`}>
            {fact.category} Fact
          </span>
        </div>

        <p className="text-foreground text-lg font-medium leading-relaxed flex-1">
          "{fact.fact}"
        </p>

        <div className="flex items-center justify-between mt-6">
          {/* Dots */}
          <div className="flex gap-1.5">
            {VIDEO_FACTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-neon-violet'
                    : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/70'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-full border border-neon-violet/30 flex items-center justify-center text-muted-foreground hover:text-neon-violet hover:border-neon-violet/60 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full border border-neon-violet/30 flex items-center justify-center text-muted-foreground hover:text-neon-violet hover:border-neon-violet/60 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
