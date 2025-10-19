import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { cn } from '@/utils/helpers/ui'

interface FormErrorProps {
  error?: string
  className?: string
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

export function FormError({ 
  error, 
  className, 
  showIcon = true, 
  dismissible = false,
  onDismiss 
}: FormErrorProps) {
  if (!error) return null

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800',
        dismissible && 'pr-10',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
      )}
      
      <div className="flex-1">
        <p className="font-medium">Error</p>
        <p className="text-red-700">{error}</p>
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-1 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface FormErrorsProps {
  errors: Record<string, string>
  className?: string
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: (field: string) => void
}

export function FormErrors({ 
  errors, 
  className, 
  showIcon = true, 
  dismissible = false,
  onDismiss 
}: FormErrorsProps) {
  if (!errors || Object.keys(errors).length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      {Object.entries(errors).map(([field, error]) => (
        <FormError
          key={field}
          error={error}
          showIcon={showIcon}
          dismissible={dismissible}
          onDismiss={onDismiss ? () => onDismiss(field) : undefined}
        />
      ))}
    </div>
  )
}

interface FieldErrorProps {
  error?: string
  className?: string
  showIcon?: boolean
}

export function FieldError({ error, className, showIcon = false }: FieldErrorProps) {
  if (!error) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm text-red-600 mt-1',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && <AlertCircle className="h-3 w-3 flex-shrink-0" />}
      <span>{error}</span>
    </div>
  )
}
