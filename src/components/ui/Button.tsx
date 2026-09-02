import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, children, className, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5 font-semibold',
    }

    const variantStyles = {
      primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 border border-emerald-400/30',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-md',
      accent: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20',
      outline: 'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20',
      ghost: 'bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white',
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
