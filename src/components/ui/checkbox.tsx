'use client'

import { cn } from '@/utilities/ui'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import * as React from 'react'

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  error?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, error, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <CheckboxPrimitive.Root
      className={cn(
        'peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        error && 'border-red-500',
        className,
      )}
      ref={ref}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {error && (
      <span className="text-sm text-red-500">{error}</span>
    )}
  </div>
))

Checkbox.displayName = 'Checkbox'

export { Checkbox }
