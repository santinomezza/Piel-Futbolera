import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost' | 'inverse'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, children, className, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-400 focus:ring-offset-cream-50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]'

    const sizeStyles = {
      sm: 'px-4 py-2 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-sm gap-2.5',
    }

    const variantStyles = {
      primary: 'bg-lime-400 text-ink-900 hover:bg-lime-500 hover:shadow-[0_8px_24px_rgba(197,248,42,0.4)] hover:-translate-y-0.5',
      secondary: 'bg-ink-900 text-cream-50 hover:bg-ink-800 hover:-translate-y-0.5',
      accent: 'bg-ink-900 text-lime-400 border border-lime-400/40 hover:bg-ink-800',
      outline: 'bg-transparent text-ink-900 border border-ink-900/15 hover:border-ink-900 hover:bg-ink-900/[0.03]',
      danger: 'bg-rose-500 hover:bg-rose-600 text-ink-900 shadow-md',
      ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 hover:text-ink-900',
      inverse: 'bg-cream-50 text-ink-900 hover:bg-white hover:-translate-y-0.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
