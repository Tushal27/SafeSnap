import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { SEVERITY_LABELS } from '@/constants';
import type { SeverityLevel } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  severity?: SeverityLevel;
}

const severityConfig: Record<SeverityLevel, { dot: string; text: string; label: string }> = {
  LOW: {
    dot: 'bg-yellow-400',
    text: 'text-yellow-600',
    label: 'Low',
  },
  MEDIUM: {
    dot: 'bg-orange-400',
    text: 'text-orange-500',
    label: 'Medium',
  },
  HIGH: {
    dot: 'bg-red-400',
    text: 'text-red-500',
    label: 'High',
  },
  CRITICAL: {
    dot: 'bg-red-700',
    text: 'text-red-700 font-bold',
    label: 'Critical',
  },
};

const variantConfig: Record<BadgeVariant, { dot: string; text: string }> = {
  default: { dot: 'bg-gray-400', text: 'text-gray-500' },
  success: { dot: 'bg-green-400', text: 'text-green-600' },
  warning: { dot: 'bg-yellow-400', text: 'text-yellow-600' },
  error: { dot: 'bg-red-400', text: 'text-red-500' },
  info: { dot: 'bg-indigo-400', text: 'text-indigo-600' },
};

export function Badge({ variant = 'default', severity, className, children, ...rest }: BadgeProps) {
  const config = severity ? severityConfig[severity] : variantConfig[variant];
  const displayLabel = severity ? SEVERITY_LABELS[severity] : undefined;

  return (
    <span
      className={cn(
        'neu-inset inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-semibold',
        config.text,
        className,
      )}
      {...rest}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)}
        aria-hidden="true"
      />
      {severity && !children ? displayLabel : children}
    </span>
  );
}
