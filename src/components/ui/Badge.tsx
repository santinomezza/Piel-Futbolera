import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'lime' | 'rose' | 'amber' | 'ink' | 'emerald'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-full tracking-wide transition-all uppercase'

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  }

  const variantStyles = {
    primary: 'bg-lime-400 text-ink-900',
    secondary: 'bg-ink-100 text-ink-700',
    gold: 'bg-amber-100 text-amber-800',
    lime: 'bg-lime-100 text-lime-600',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    outline: 'border border-ink-900/15 text-ink-700 bg-transparent',
    ink: 'bg-ink-900 text-cream-50',
    emerald: 'bg-lime-100 text-lime-700',
  }

  return (
    <span className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}>
      {children}
    </span>
  )
}
