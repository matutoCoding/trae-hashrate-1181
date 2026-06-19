import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gradientClasses = [
  'from-ink to-ink/70',
  'from-cinnabar to-cinnabar/70',
  'from-bamboo to-bamboo/70',
  'from-gold to-gold/70',
  'from-purple-700 to-purple-500',
  'from-teal-600 to-teal-500',
  'from-slate-600 to-slate-500',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getInitial(name: string): string {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const firstChar = trimmed.charAt(0);
  if (/[\u4e00-\u9fa5]/.test(firstChar)) {
    return firstChar;
  }
  return firstChar.toUpperCase();
}

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
  const gradientIdx = hashString(name || '') % gradientClasses.length;
  const initial = getInitial(name);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shrink-0',
        'shadow-sm',
        gradientClasses[gradientIdx],
        sizeClasses[size],
        className
      )}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
    >
      {initial}
    </div>
  );
}
