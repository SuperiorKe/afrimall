'use client'

interface LoadingStateProps {
  title: string
  message: string
  className?: string
}

export function LoadingState({ title, message, className = '' }: LoadingStateProps) {
  return (
    <div className={`rounded-lg border border-blue-200 bg-blue-50 p-6 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      </div>
    </div>
  )
}
