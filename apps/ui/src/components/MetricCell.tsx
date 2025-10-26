import { cn } from '@/lib/utils';

interface MetricCellProps {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  status?: 'active' | 'inactive' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export default function MetricCell({
  label,
  value,
  change,
  unit,
  status = 'active',
  size = 'md',
  glow = false,
}: MetricCellProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const statusClasses = {
    active: 'status-active',
    inactive: 'status-inactive',
    warning: 'status-warning',
    error: 'status-error',
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="text-xs uppercase tracking-wider text-fg/60">
        {label}
      </div>
      <div className={cn('font-bold terminal-text', sizeClasses[size], statusClasses[status], glow && 'glow')}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-fg/60">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={cn('text-sm font-medium', change >= 0 ? 'text-accent' : 'status-error')}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

