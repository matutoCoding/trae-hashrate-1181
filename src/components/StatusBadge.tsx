import { CheckCircle2, Clock, XCircle, AlertCircle, Hourglass, Bell, ThumbsUp, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'booked'
  | 'checked_in'
  | 'timeout_released'
  | 'completed'
  | 'waiting'
  | 'notified'
  | 'confirmed'
  | 'archived';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  StatusType,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info'; icon: typeof CheckCircle2 }
> = {
  booked: { label: '已预约', variant: 'info', icon: CheckCircle2 },
  checked_in: { label: '已签到', variant: 'success', icon: CheckCircle2 },
  timeout_released: { label: '超时释放', variant: 'danger', icon: XCircle },
  completed: { label: '已完成', variant: 'success', icon: CheckCircle2 },
  waiting: { label: '候补中', variant: 'warning', icon: Hourglass },
  notified: { label: '已通知', variant: 'warning', icon: Bell },
  confirmed: { label: '已确认', variant: 'info', icon: ThumbsUp },
  archived: { label: '已归档', variant: 'info', icon: Archive },
};

const variantStyles: Record<
  'success' | 'warning' | 'danger' | 'info',
  { bg: string; text: string; border: string; dot: string }
> = {
  success: {
    bg: 'bg-bamboo/10',
    text: 'text-bamboo',
    border: 'border-bamboo/20',
    dot: 'bg-bamboo',
  },
  warning: {
    bg: 'bg-gold/10',
    text: 'text-gold',
    border: 'border-gold/20',
    dot: 'bg-gold',
  },
  danger: {
    bg: 'bg-cinnabar/10',
    text: 'text-cinnabar',
    border: 'border-cinnabar/20',
    dot: 'bg-cinnabar',
  },
  info: {
    bg: 'bg-ink/5',
    text: 'text-ink/70',
    border: 'border-ink/10',
    dot: 'bg-ink/50',
  },
};

export default function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  const styles = variantStyles[config.variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        styles.bg,
        styles.text,
        styles.border,
        className,
      )}
    >
      {showIcon ? (
        <Icon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', styles.dot)} />
      )}
      {config.label}
    </span>
  );
}
