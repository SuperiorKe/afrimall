'use client'

import React from 'react'
import { Truck, Shield, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/helpers/ui'

interface ProductFeaturesProps {
  className?: string
}

export function ProductFeatures({ className }: ProductFeaturesProps) {
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $100',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Shield,
      title: 'Authentic Quality',
      description: '100% authentic African craftsmanship',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day return policy',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <div className={cn('space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700', className)}>
      {features.map((feature, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={cn('flex-shrink-0 p-2 rounded-lg bg-gray-50 dark:bg-gray-800', feature.color)}>
            <feature.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {feature.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
