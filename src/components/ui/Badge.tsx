import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'gold' | 'emerald' | 'rose' | 'amber' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide transition-all'
  
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  }

  const variantStyles = {
    primary: 'bg-zinc-100/15 text-zinc-300 border border-white/15',
    secondary: 'bg-zinc-800 text-slate-300 border border-zinc-700',
    gold: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    emerald: 'bg-zinc-100/15 text-zinc-300 border border-white/15',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    outline: 'border border-zinc-700 text-slate-300 bg-transparent',
  }

  return (
    <span className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}>
      {children}
    </span>
  )
}
