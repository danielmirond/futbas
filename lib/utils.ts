import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, locale: string = 'ca') {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })
}

export function getMatchStatusColor(status: string) {
  switch (status) {
    case 'live': return 'text-loss'
    case 'finished': return 'text-muted'
    case 'scheduled': return 'text-accent'
    default: return 'text-muted'
  }
}
