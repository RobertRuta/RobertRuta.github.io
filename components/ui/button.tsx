import * as React from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-terminal-green/15 text-terminal-green border border-terminal-green/30 hover:bg-terminal-green/25',
  secondary: 'bg-terminal.dim text-terminal-green border border-terminal-green/20 hover:bg-terminal-green/10',
  ghost: 'bg-transparent text-terminal-green hover:bg-terminal-green/10',
  outline: 'bg-transparent text-terminal-green border border-terminal-green/40 hover:bg-terminal-green/20',
  link: 'bg-transparent text-terminal-green underline-offset-4 hover:underline',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terminal-green/50 disabled:pointer-events-none disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn((children as any).props?.className, classes),
      })
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'


