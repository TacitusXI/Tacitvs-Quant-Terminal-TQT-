export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(
  value: number,
  decimals: number = 2,
  prefix: string = '',
  suffix: string = ''
): string {
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  return formatNumber(value * 100, decimals, '', '%');
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour12: false });
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

