interface AnimatedHeadingProps {
  text: string;
  variant?: 'shimmer' | 'glow-violet' | 'glow-cyan' | 'glow-pink' | 'gradient';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export default function AnimatedHeading({
  text,
  variant = 'shimmer',
  className = '',
  as: Tag = 'h2',
}: AnimatedHeadingProps) {
  const variantClasses = {
    shimmer: 'animate-shimmer font-orbitron',
    'glow-violet': 'text-neon-violet text-glow-violet animate-glow-pulse font-orbitron',
    'glow-cyan': 'text-neon-cyan text-glow-cyan animate-glow-pulse font-orbitron',
    'glow-pink': 'text-neon-pink text-glow-pink animate-glow-pulse font-orbitron',
    gradient: 'gradient-text font-orbitron',
  };

  return (
    <Tag className={`${variantClasses[variant]} ${className}`}>
      {text}
    </Tag>
  );
}
