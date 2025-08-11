import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {/* Afrimall Logo - Stylized "A" with green and orange bars */}
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
      >
        {/* Left green bar */}
        <path d="M15 50 L25 10 L30 10 L40 50 L35 50 L33 45 L22 45 L20 50 Z" fill="#22C55E" />

        {/* Right orange bar */}
        <path d="M25 10 L30 10 L40 50 L35 50 L33 45 L22 45 L20 50 L15 50 L25 10 Z" fill="#F97316" />

        {/* Inner white highlight */}
        <path d="M22 45 L33 45 L30 15 L27 15 Z" fill="white" fillOpacity="0.3" />
      </svg>

      {/* Afrimall Text */}
      <div className="mt-2 text-center">
        <span className="text-xl font-bold text-gray-900 dark:text-white">Afrimall</span>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">African Marketplace</div>
      </div>
    </div>
  )
}
