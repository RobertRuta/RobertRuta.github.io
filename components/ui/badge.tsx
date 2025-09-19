import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'secondary' | 'outline'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-terminal-green/20 text-terminal-green border border-terminal-green/30',
  secondary: 'bg-terminal.dim text-terminal-green border border-terminal-green/20',
  outline: 'bg-transparent text-terminal-green border border-terminal-green/40',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}


