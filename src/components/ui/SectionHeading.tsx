import React from 'react'
import { clsx } from 'clsx'

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
  accentWord?: string
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  accentWord,
}) => {
  const renderTitle = () => {
    if (!accentWord || typeof title !== 'string') return title
    const parts = title.split(accentWord)
    if (parts.length === 1) return title
    return (
      <>
        {parts[0]}
        <span className="text-lime-500">{accentWord}</span>
        {parts.slice(1).join(accentWord)}
      </>
    )
  }

  return (
    <div
      className={clsx(
        'space-y-3',
        align === 'center' && 'text-center mx-auto max-w-2xl',
        className
      )}
    >
      {eyebrow && (
        <div className={clsx('flex items-center gap-2', align === 'center' && 'justify-center')}>
          <span className="w-8 h-px bg-lime-400" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink-500">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-900 font-outfit leading-[1.05] tracking-tight">
        {renderTitle()}
      </h2>
      {description && (
        <p className={clsx('text-sm sm:text-base text-ink-500 leading-relaxed', align === 'center' && 'max-w-xl mx-auto')}>
          {description}
        </p>
      )}
    </div>
  )
}
