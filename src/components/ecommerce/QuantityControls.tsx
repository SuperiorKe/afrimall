'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface QuantityControlsProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  minQuantity?: number
  maxQuantity?: number
  className?: string
}

export function QuantityControls({ 
  quantity, 
  onQuantityChange, 
  minQuantity = 1, 
  maxQuantity = 99,
  className 
}: QuantityControlsProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= minQuantity && value <= maxQuantity) {
      onQuantityChange(value)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Quantity
      </label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= minQuantity}
          className="h-10 w-10 rounded-lg"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={minQuantity}
          max={maxQuantity}
          className="h-10 w-16 text-center rounded-lg"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= maxQuantity}
          className="h-10 w-10 rounded-lg"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
