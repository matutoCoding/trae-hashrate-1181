import type { ReactNode, ComponentType } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-ink/5',
        )}
      >
        <Icon
          className={cn(
            'h-10 w-10 text-ink/30',
            iconClassName,
          )}
        />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink/50 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
