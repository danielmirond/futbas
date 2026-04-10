import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'accent' | 'win' | 'loss' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'pill pill-muted',
  accent: 'pill pill-red',
  win: 'pill pill-green',
  loss: 'pill pill-red',
  muted: 'pill pill-muted',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
