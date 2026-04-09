import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'accent' | 'win' | 'loss' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-ink/10 text-ink',
  accent: 'bg-accent-light text-accent',
  win: 'bg-win/10 text-win',
  loss: 'bg-loss/10 text-loss',
  muted: 'bg-ink/5 text-muted',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-sans ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
