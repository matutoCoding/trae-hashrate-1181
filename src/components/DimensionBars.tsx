import { cn } from '@/lib/utils';

export interface DimensionScores {
  styleMatch: number;
  teacherRating: number;
  styleFit: number;
  experience: number;
  priceMatch: number;
}

interface DimensionBarsProps {
  scores: DimensionScores;
  className?: string;
}

const dimensionConfig = [
  {
    key: 'styleMatch' as const,
    label: '书体匹配',
    gradient: 'from-cinnabar to-cinnabar/60',
  },
  {
    key: 'teacherRating' as const,
    label: '历史评分',
    gradient: 'from-gold to-gold/60',
  },
  {
    key: 'styleFit' as const,
    label: '风格契合',
    gradient: 'from-bamboo to-bamboo/60',
  },
  {
    key: 'experience' as const,
    label: '教龄经验',
    gradient: 'from-ink to-ink/60',
  },
  {
    key: 'priceMatch' as const,
    label: '价格匹配',
    gradient: 'from-cinnabar/80 via-gold to-bamboo/80',
  },
];

export default function DimensionBars({ scores, className }: DimensionBarsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {dimensionConfig.map(({ key, label, gradient }) => {
        const value = Math.min(Math.max(scores[key], 0), 100);

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink/70">{label}</span>
              <span className="font-semibold tabular-nums text-ink">{value.toFixed(0)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ink/5">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-[width] duration-300 ease-out',
                  gradient,
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
