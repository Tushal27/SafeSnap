import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { SEVERITY_BADGE_CLASSES, SEVERITY_LABELS } from '@/constants';
import type { SeverityLevel } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  severity?: SeverityLevel;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export function Badge({ variant = 'default', severity, className, children, ...rest }: BadgeProps) {
  const colorClass = severity ? SEVERITY_BADGE_CLASSES[severity] : variantClasses[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
      {...rest}
    >
      {severity && !children ? SEVERITY_LABELS[severity] : children}
    </span>
  );
}
