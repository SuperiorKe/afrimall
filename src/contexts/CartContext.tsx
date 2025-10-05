'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: string
  product: {
    id: string
    title: string
    price: number
    images: Array<{
      url: string
      alt: string
    }>
    categories: Array<{
      id: string
      title: string
      slug: string
    }>
  }
  variant?: {
    id: string
    title: string
    price: number
  } | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  itemCount: number
  currency: string
  customer?: string
  sessionId?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null
  isOnline: boolean
  lastSyncTime: Date | null
  loadCart: () => Promise<void>
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<boolean>
  updateQuantity: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) => Promise<boolean>
  removeFromCart: (productId: string, variantId?: string) => Promise<boolean>
  clearCart: () => Promise<void>
  refreshCart: () => void
  retryFailedOperation: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [pendingOperations, setPendingOperations] = useState<Array<() => Promise<any>>>([])

  const getSessionId = () => {
    let sessionId = localStorage.getItem('afrimall_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('afrimall_session_id', sessionId)
    }
    return sessionId
  }

  const getCustomerId = () => {
    // TODO: Get from auth context when implemented
    return null
  }

  const loadCart = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch(
        `/api/cart?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}`,
      )
      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        setLastSyncTime(new Date())
        // Process any pending operations
        await processPendingOperations()
      } else {
        setCart(null)
        setError(data.message || 'Failed to load cart')
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setError('Failed to load cart. Please try again.')
      setCart(null)
      setIsOnline(false)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  // Helper function to process pending operations when back online
  const processPendingOperations = async () => {
    if (pendingOperations.length > 0 && isOnline) {
      console.log(`Processing ${pendingOperations.length} pending operations`)
      const operations = [...pendingOperations]
      setPendingOperations([])

      for (const operation of operations) {
        try {
          await operation()
        } catch (error) {
          console.error('Error processing pending operation:', error)
        }
      }
    }
  }

  // Optimistic update helper
  const optimisticUpdate = (updateFn: (currentCart: Cart | null) => Cart | null) => {
    setCart((prevCart) => {
      const updatedCart = updateFn(prevCart)
      // Dispatch event immediately for UI updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }))
      return updatedCart
    })
  }

  // Retry failed operations
  const retryFailedOperation = async () => {
    if (pendingOperations.length > 0) {
      await processPendingOperations()
    } else {
      await loadCart()
    }
  }

  const addToCart = async (
    productId: string,
    variantId?: string,
    quantity = 1,
  ): Promise<boolean> => {
    // Optimistic update - immediately update UI
    optimisticUpdate((currentCart) => {
      if (!currentCart) {
        // Create new cart optimistically
        return {
          id: 'temp',
          items: [
            {
              id: 'temp-item',
              product: { id: productId, title: 'Loading...', price: 0, images: [], categories: [] },
              variant: variantId ? { id: variantId, title: 'Loading...', price: 0 } : null,
              quantity,
              unitPrice: 0,
              totalPrice: 0,
            },
          ],
          subtotal: 0,
          itemCount: quantity,
          currency: 'USD',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      } else {
        // Add to existing cart optimistically
        const existingItemIndex = currentCart.items.findIndex(
          (item) =>
            item.product.id === productId && (item.variant?.id || null) === (variantId || null),
        )

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...currentCart.items]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            totalPrice:
              updatedItems[existingItemIndex].unitPrice *
              (updatedItems[existingItemIndex].quantity + quantity),
          }
          return {
            ...currentCart,
            items: updatedItems,
            itemCount: currentCart.itemCount + quantity,
            subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
          }
        } else {
          // Add new item
          const newItem = {
            id: `temp-${Date.now()}`,
            product: { id: productId, title: 'Loading...', price: 0, images: [], categories: [] },
            variant: variantId ? { id: variantId, title: 'Loading...', price: 0 } : null,
            quantity,
            unitPrice: 0,
            totalPrice: 0,
          }
          return {
            ...currentCart,
            items: [...currentCart.items, newItem],
            itemCount: currentCart.itemCount + quantity,
            subtotal: currentCart.subtotal + newItem.totalPrice,
          }
        }
      }
    })

    try {
      setError(null)
      setIsOnline(true)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          productId,
          variantId,
          quantity,
          currency: 'USD',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        setLastSyncTime(new Date())
        // Trigger cart update event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
        return true
      } else {
        // Revert optimistic update on failure
        await loadCart(false)
        setError(data.message || 'Failed to add item to cart')
        return false
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsOnline(false)
      // Store operation for retry when back online
      setPendingOperations((prev) => [...prev, () => addToCart(productId, variantId, quantity)])
      setError('Failed to add item to cart. Will retry when connection is restored.')
      // Revert optimistic update
      await loadCart(false)
      return false
    }
  }

  const updateQuantity = async (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ): Promise<boolean> => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch('/api/cart/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          productId,
          variantId,
          quantity,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
        return true
      } else {
        setError(data.message || 'Failed to update quantity')
        return false
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      setError('Failed to update quantity. Please try again.')
      return false
    }
  }

  const removeFromCart = async (productId: string, variantId?: string): Promise<boolean> => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch(
        `/api/cart/items?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}&productId=${productId}${variantId ? `&variantId=${variantId}` : ''}`,
        {
          method: 'DELETE',
        },
      )

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
        return true
      } else {
        setError(data.message || 'Failed to remove item')
        return false
      }
    } catch (error) {
      console.error('Error removing item:', error)
      setError('Failed to remove item. Please try again.')
      return false
    }
  }

  const clearCart = async () => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch(
        `/api/cart?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}`,
        {
          method: 'DELETE',
        },
      )

      const data = await response.json()

      if (data.success) {
        setCart(null)
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: null }))
      } else {
        setError(data.message || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      setError('Failed to clear cart. Please try again.')
    }
  }

  const refreshCart = () => {
    loadCart()
  }

  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Focus refresh - reload cart when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (lastSyncTime && Date.now() - lastSyncTime.getTime() > 30000) {
        // 30 seconds
        loadCart(false) // Silent refresh
      }
    }

    const handleOnline = () => {
      setIsOnline(true)
      processPendingOperations()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [lastSyncTime, loadCart])

  // Periodic sync - refresh cart every 5 minutes if user is active
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (document.visibilityState === 'visible' && isOnline) {
          loadCart(false) // Silent refresh
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [isOnline, loadCart])

  const value: CartContextType = {
    cart,
    loading,
    error,
    isOnline,
    lastSyncTime,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    retryFailedOperation,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
