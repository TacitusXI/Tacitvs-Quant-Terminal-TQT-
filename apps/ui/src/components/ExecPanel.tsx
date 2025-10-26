import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ExecPanelProps {
  children: ReactNode;
  className?: string;
  mode?: 'normal' | 'warning' | 'critical';
}

export default function ExecPanel({
  children,
  className,
  mode = 'normal',
}: ExecPanelProps) {
  const modeStyles = {
    normal: 'border-grid',
    warning: 'border-yellow-500/50',
    critical: 'border-accent2 border-glow',
  };

  return (
    <div
      className={cn(
        'panel border-2 transition-all duration-300',
        modeStyles[mode],
        className
      )}
    >
      {children}
    </div>
  );
}

