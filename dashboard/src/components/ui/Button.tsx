import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled ?? isLoading;

    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ' +
      'disabled:cursor-not-allowed disabled:opacity-50';

    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'neu-btn-primary text-white',
      secondary: 'neu-btn text-gray-600',
      ghost:
        'bg-transparent text-gray-500 hover:text-indigo-500 rounded-full px-3 transition-colors',
      danger:
        'text-white rounded-[50px] transition-all duration-150 ' +
        'focus-visible:ring-red-400',
    };

    // danger gets its own inline style so it shares the neu shadow geometry
    const dangerStyle =
      variant === 'danger'
        ? {
            background: 'linear-gradient(145deg,#ef4444,#b91c1c)',
            boxShadow:
              '5px 5px 12px var(--neu-shadow-dark),-5px -5px 12px var(--neu-shadow-light)',
          }
        : undefined;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={dangerStyle}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...rest}
      >
        {isLoading ? (
          <Spinner
            size="sm"
            className={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-gray-500'}
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
