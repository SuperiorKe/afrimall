'use client'

import { DetailedError, getErrorColorScheme, getErrorIconPath } from '@/lib/checkout/errorHandling'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  error: DetailedError
  onAction: (action: string) => void
  className?: string
}

export function ErrorDisplay({ error, onAction, className = '' }: ErrorDisplayProps) {
  const colors = getErrorColorScheme(error.severity)
  const iconPath = getErrorIconPath(error.severity)

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={colors.icon}>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${colors.text}`}>
            {error.title}
          </h3>
          <div className={`mt-2 text-sm ${colors.text}`}>
            <p>{error.message}</p>
            {error.reasons && (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {error.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {error.actions.map((action, index) => (
              <Button
                key={index}
                onClick={() => onAction(action.action)}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                className="text-sm"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
