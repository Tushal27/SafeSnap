import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ className, noPadding = false, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900',
        !noPadding && 'p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...rest}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...rest }: CardTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)} {...rest}>
      {children}
    </h2>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...rest }: CardContentProps) {
  return (
    <div className={cn('text-gray-700 dark:text-gray-300', className)} {...rest}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div className={cn('mt-4 flex items-center border-t border-gray-100 pt-4 dark:border-gray-800', className)} {...rest}>
      {children}
    </div>
  );
}
