import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ className, noPadding = false, children, ...rest }: CardProps) {
  return (
    <div
      className={cn('neu-card', !noPadding && 'p-6', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div className={cn('mb-5 flex items-center justify-between', className)} {...rest}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...rest }: CardTitleProps) {
  return (
    <h2
      className={cn('text-lg font-bold text-gray-600', className)}
      {...rest}
    >
      {children}
    </h2>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...rest }: CardContentProps) {
  return (
    <div className={cn('text-gray-600', className)} {...rest}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div
      className={cn('mt-5 flex items-center pt-4', className)}
      style={{ borderTop: '1px solid rgba(184,190,201,0.35)' }}
      {...rest}
    >
      {children}
    </div>
  );
}
