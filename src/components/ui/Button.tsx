import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-brand-primary text-white hover:bg-canvas-accent-hover',
      secondary: 'bg-canvas-grid text-text-primary hover:bg-canvas-hover',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-canvas-grid',
      icon: 'text-text-secondary hover:text-text-primary hover:bg-canvas-grid p-0',
    };

    const sizes = {
      sm: 'h-7 px-2 text-xs',
      md: 'h-9 px-4',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${variant === 'icon' ? 'h-8 w-8' : sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
