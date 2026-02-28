import React from 'react';

interface AnimatedHeadingProps {
  text: string;
  variant?: 'shimmer' | 'glow' | 'typewriter';
  className?: string;
}

export default function AnimatedHeading({ text, variant = 'shimmer', className = '' }: AnimatedHeadingProps) {
  if (variant === 'shimmer') {
    return (
      <h1
        className={`animate-shimmer ${className}`}
        style={{
          background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-violet), var(--neon-pink), var(--neon-cyan))',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 3s linear infinite',
        }}
      >
        {text}
      </h1>
    );
  }

  if (variant === 'glow') {
    return (
      <h1
        className={`animate-glow-pulse ${className}`}
        style={{
          color: 'var(--neon-cyan)',
          textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)',
          animation: 'glow-pulse 2s ease-in-out infinite',
        }}
      >
        {text}
      </h1>
    );
  }

  if (variant === 'typewriter') {
    return (
      <h1
        className={`overflow-hidden whitespace-nowrap border-r-2 ${className}`}
        style={{
          color: 'var(--neon-cyan)',
          borderColor: 'var(--neon-cyan)',
          animation: 'typewriter 3s steps(40, end) forwards',
          width: '0',
        }}
      >
        {text}
      </h1>
    );
  }

  return <h1 className={className}>{text}</h1>;
}
