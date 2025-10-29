'use client'

import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react'

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          label: 'Pending',
          bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          icon: <Package className="h-4 w-4" />,
        }
      case 'confirmed':
        return {
          label: 'Confirmed',
          bgColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <CheckCircle className="h-4 w-4" />,
        }
      case 'processing':
        return {
          label: 'Processing',
          bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Package className="h-4 w-4" />,
        }
      case 'shipped':
        return {
          label: 'Shipped',
          bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          icon: <Truck className="h-4 w-4" />,
        }
      case 'delivered':
        return {
          label: 'Delivered',
          bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <CheckCircle className="h-4 w-4" />,
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          bgColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          icon: <XCircle className="h-4 w-4" />,
        }
      case 'refunded':
        return {
          label: 'Refunded',
          bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
          icon: <RefreshCw className="h-4 w-4" />,
        }
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <Package className="h-4 w-4" />,
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge className={`${config.bgColor} ${className || ''}`}>
      <span className="flex items-center gap-1.5">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  )
}
