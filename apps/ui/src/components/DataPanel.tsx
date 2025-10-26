import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  glow?: boolean;
}

export default function DataPanel({
  title,
  children,
  className,
  headerRight,
  glow = false,
}: DataPanelProps) {
  return (
    <div className={cn('panel flex flex-col', glow && 'border-glow', className)}>
      <div className="flex items-center justify-between border-b border-grid p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent terminal-text">
          {title}
        </h3>
        {headerRight && <div>{headerRight}</div>}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}

